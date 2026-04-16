import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()
import { form3Service } from "../../form3/Services/form3.Service";


export const form3Usecases = {

  /*GET Form2 list for Form3*/
  async getForm2ListForForm3(uid: number, fm2id?: number | string) {
    return await form3Service.fetchForm2ForForm3(uid, fm2id);
  },
/* GET Form3 list */
  async getForm3ListByUser(params: { 
    uid: number; 
    role: number; 
    zone_id?: string; 
  }) {

    const { uid, role, zone_id } = params;

    const form3List = await form3Service.fetchForm3ListByUser({
      uid,
      role,
      zone_id, 
    });

    if (!form3List || form3List.length === 0) {
      return [];
    }

    return form3List;
  },


  /*GET Editable*/
  async getEditableForm3(uid: number) {
    return await form3Service.fetchEditableForm3(uid);
  },

  /*Submit Form3*/
  async submitForm3Usecase(payload: any) {
    const {
      uid,
      form2_id,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      remarks,
    } = payload;

    const selected_soc =
      payload.selected_soc ??
      payload.selected_societies ??
      [];

    if (!Array.isArray(selected_soc)) {
      throw new Error("selected_soc must be an array");
    }

    /*Create Form3 parent*/
    const form3Record = await form3Service.createForm3Parent({
      uid,
      form2_id,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      remarks,
      selected_soc_count: selected_soc.length,
    });

    /*Insert Form3 societies*/
    await form3Service.insertForm3Societies(
      form3Record.id,
      selected_soc
    );

    /*Build & return response*/
    return form3Service.buildSubmitResponse(form3Record);
  },

  /*PUT Update Form3*/
  async updateForm3Usecase(payload: any) {
    const {
      uid,
      form3_id,
    } = payload;

    if (!form3_id) {
      throw new Error("form3_id is required");
    }

    return await form3Service.updateForm3(
      form3_id,
      uid,
      payload
    );
  },

/*PDF DOWNLOAD*/
async getForm3PdfUsecase(payload: {
  uid: number;
  role: number;
  zone_id?: string;
  res: any;
}) {
  const { uid, role, zone_id, res } = payload;

  /* -------------------- GET LIST -------------------- */
  const list = await this.getForm3ListByUser({
    uid,
    role,
    zone_id,
  });

  if (!list || list.length === 0) {
    throw new Error("No data found");
  }

  /* -------------------- TITLE -------------------- */
  const title = "இறுதி வாக்காளர் பட்டியல் வெளியிடப்பட்ட விவரம்";

  /* -------------------- COLUMNS (🔥 ONLY ONE HEADER ROW) -------------------- */
  const columns = [
    { header: "வ.எண்", key: "sno", width: 25 },

    {
      header: "மாவட்ட தேர்தல் அலுவலர் மாவட்டம்/மண்டலம்",
      key: "district_name",
      width: 90,
    },

    {
      header: "மாவட்ட தேர்தல் அலுவலர் சரகம்",
      key: "zone_name",
      width: 90,
    },

    {
      header:
        "உறுப்பினர் பட்டியல் தயாரித்து வெளியிட்டுள்ள சங்கங்களின் பெயர்",
      key: "society_name",
      width: "*",
    },

    {
      header:
        "சங்கத்தால் வெளியிடப்பட்ட உறுப்பினர் பட்டியலில் உள்ளபடி உறுப்பினர்களின் எண்ணிக்கை",
      key: "ass_memlist",
      width: 80,
    },

    {
      header:
        "வாக்காளர் பட்டியல் அலுவலரால் வெளியிடப்பட்ட வாக்காளர் பட்டியலுக்கு கோருரிமை அல்லது மறுப்பு தெரிவிக்கப்பட்ட விபரம் (ஆம் / இல்லை)",
      key: "ero_claim",
      width: 100,
    },

    /* 🔥 Instead of subHeader → directly put here */
    {
      header: "சேர்க்கப்பட்ட உறுப்பினர்களின் எண்ணிக்கை",
      key: "jcount",
      width: 60,
    },

    {
      header: "நீக்கப்பட்ட உறுப்பினர்களின் எண்ணிக்கை",
      key: "rcount",
      width: 60,
    },

    {
      header:
        "வாக்காளர் பட்டியல் அலுவலரால் இறுதி வாக்காளர்களின் எண்ணிக்கை",
      key: "tot_voters",
      width: 80,
    },
  ];

  /* -------------------- ROWS -------------------- */
  const rows: any[] = [];
  let index = 1;

  for (const form of list) {
    for (const soc of form.form3_societies || []) {
      rows.push({
        sno: index++,

        district_name: form.district_name || "-",
        zone_name: form.zone_name || "-",

        society_name: soc.society_name || "-",

        ass_memlist: soc.ass_memlist ?? "-",

        ero_claim:
          soc.ero_claim === 1
            ? "ஆம்"
            : soc.ero_claim === 0
            ? "இல்லை"
            : "-",

        jcount: soc.jcount ?? 0,
        rcount: soc.rcount ?? 0,

        tot_voters: soc.tot_voters ?? 0,
      });
    }
  }

  /* -------------------- GENERATE PDF -------------------- */
  const { generatePDF } = await import("../../../utils/pdfGenerator");

  return generatePDF(res, title, columns, rows, {
    extraHeader: `துறை -- ${list[0]?.district_name || "-"}`,

    /* 🔥 ONLY GROUP HEADER (NO subHeaders) */
    groupHeaders: [
      { text: "", colSpan: 6 },
      {
        text: "வாக்காளர் பட்டியல் அலுவலரால் வெளியிடப்பட்ட வாக்காளர் பட்டியலில் திருத்தங்கள் மேற்கொள்ளப்பட்ட சங்கங்கள் மற்றும் விபரம்",
        colSpan: 2,
      },
      { text: "", colSpan: 1 },
    ],
  });
},

};
