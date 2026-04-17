import { PrismaClient } from "@prisma/client";
import { Form7Service } from "../../form7/Services/form7.Service";
// import { generatePDF } from "../../../utils/pdfGenerator"
// import { tamilFont } from "../../../utils/tamilFonts";


export const prisma = new PrismaClient();

export const Form7Usecase = {
  /*PREVIEW FORM7*/
  async preview(uid: number) {
    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const districtId: number = user.district_id;

    const district = await Form7Service.getDistrictById(districtId);
    if (!district) {
      throw { statusCode: 400, message: "District not found" };
    }

    const form6 = await Form7Service.getLatestSubmittedForm6(uid);
    if (!form6) {
      throw { statusCode: 400, message: "Form6 not submitted yet" };
    }

    const form6Societies =
      await Form7Service.getForm6Societies(form6.id);

    const form3 = await Form7Service.getLatestForm3(uid);
    if (!form3) {
      throw { statusCode: 400, message: "Form3 data not available" };
    }

    const societies: any[] = [];

    for (const soc of form6Societies) {
      const rural =
        await Form7Service.getForm4SocietyCounts(
          soc.society_id
        );

      const decision =
        await Form7Service.getForm6SocietyDecision(
          form6.id,
          soc.society_id
        );

      const ruralSc = rural?.rural_sc_st ?? 0;
      const ruralWomen = rural?.rural_women ?? 0;
      const ruralGeneral = rural?.rural_general ?? 0;
      const ruralTotal = rural?.rural_tot_voters ?? 0;

      const declaredSc = decision?.final_sc_st_count ?? 0;
      const declaredWomen = decision?.final_women_count ?? 0;
      const declaredGeneral = decision?.final_general_count ?? 0;

      const dlgSc = decision?.final_sc_st_dlg_count ?? 0;
      const dlgWomen = decision?.final_women_dlg_count ?? 0;
      const dlgGeneral = decision?.final_general_dlg_count ?? 0;

      societies.push({
        society_id: soc.society_id,
        society_name: soc.society_name,

        rural: {
          sc_st: ruralSc,
          women: ruralWomen,
          general: ruralGeneral,
          total_voters: ruralTotal,
        },

        declared: {
          sc_st: declaredSc,
          women: declaredWomen,
          general: declaredGeneral,
        },

        dlg_declared: {
          sc_st: dlgSc,
          women: dlgWomen,
          general: dlgGeneral,
        },

        qualified_categories: {
          sc_st: {
            eligible: declaredSc > ruralSc,
            count: Math.max(declaredSc - ruralSc, 0),
          },
          women: {
            eligible: declaredWomen > ruralWomen,
            count: Math.max(declaredWomen - ruralWomen, 0),
          },
          general: {
            eligible: declaredGeneral > ruralGeneral,
            count: Math.max(declaredGeneral - ruralGeneral, 0),
          },
        },
      });
    }

    return {
      district: {
        id: districtId,
        name: district.name ?? "",
      },
      form3_total: form3.selected_soc_count ?? 0,
      societies,
    };
  },

  /*SUBMIT FORM7*/
  async submit(payload: any) {
  const { uid, societies: inputSocieties } = payload;

  const user = await Form7Service.getUserDistrict(uid);
  if (user?.district_id == null) {
    throw { statusCode: 400, message: "User district not found" };
  }

  const districtId = user.district_id;

  const district = await Form7Service.getDistrictById(districtId);
  if (!district) {
    throw { statusCode: 400, message: "District not found" };
  }

  const existing =
    await Form7Service.getExistingForm7(districtId);
  if (existing) {
    throw {
      statusCode: 400,
      message: "Form7 already submitted for this district",
    };
  }

  const form6 = await Form7Service.getLatestSubmittedForm6(uid);
  if (!form6) {
    throw { statusCode: 400, message: "Form6 not submitted yet" };
  }

  const form6Societies =
    await Form7Service.getForm6Societies(form6.id);

  const form3 = await Form7Service.getLatestForm3(uid);
  if (!form3) {
    throw { statusCode: 400, message: "Form3 data not available" };
  }

  const snapshot: any[] = [];

  for (const soc of form6Societies) {
    const decision =
      await Form7Service.getForm6SocietyDecision(
        form6.id,
        soc.society_id
      );

    const rural =
      await Form7Service.getForm4SocietyCounts(
        soc.society_id
      );

    const input = inputSocieties.find(
      (i: any) => i.society_id === soc.society_id
    );
    if (!input) {
      throw {
        statusCode: 400,
        message: `Missing input for society ${soc.society_name}`,
      };
    }

    const ruralSc = rural?.rural_sc_st ?? 0;
    const ruralWomen = rural?.rural_women ?? 0;
    const ruralGeneral = rural?.rural_general ?? 0;

    const declaredSc = decision?.final_sc_st_count ?? 0;
    const declaredWomen = decision?.final_women_count ?? 0;
    const declaredGeneral = decision?.final_general_count ?? 0;

    snapshot.push({
      society_id: soc.society_id,
      society_name: soc.society_name,

      final_sc_st_count: declaredSc,
      final_women_count: declaredWomen,
      final_general_count: declaredGeneral,

      final_sc_st_dlg_count:
        declaredSc > ruralSc ? declaredSc - ruralSc : 0,

      final_women_dlg_count:
        declaredWomen > ruralWomen ? declaredWomen - ruralWomen : 0,

      final_general_dlg_count:
        declaredGeneral > ruralGeneral
          ? declaredGeneral - ruralGeneral
          : 0,

      form3_total: form3.selected_soc_count ?? 0,
      casted_votes_count: input.casted_votes_count,
      voting_percentage: input.voting_percentage,

      ballot_box_count: input.ballot_box_count,
      stamp_count: input.stamp_count,
      polling_stations_count: input.polling_stations_count,
      election_officers_count: input.election_officers_count,

      polling_suspension_count:
        input.polling_suspension_count ?? "NO_ISSUES",
    });
  }

  return prisma.$transaction(async () => {
    const form7 =
      await Form7Service.createForm7({
        district_id: districtId,
        district_name: district.name ?? "",
      });

    await Form7Service.createForm7Societies(
      form7.id,
      snapshot
    );

    return {
      form7_id: form7.id,
      district_id: districtId,
      societies_count: snapshot.length,
    };
  });
},

/* LIST FORM7 */
async list(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
}) {

  const { uid, role, zone_id } = params;

  let zoneIds: number[] = [];

  if (zone_id) {
    try {
      zoneIds = JSON.parse(zone_id);
    } catch {}
  }

  //ADMIN - latest Form7
  if (role === 1) {
    const form7 = await prisma.form7.findFirst({
      orderBy: { created_at: "desc" },
    });

    return form7 ? [form7] : [];
  }

  // JRCS - ALL districts in their zones
  else if (role === 4) {

    const districts = await prisma.district.findMany({
      where: {
        zone_id: { in: zoneIds },
      },
      select: { id: true },
    });

    const districtIds = districts.map((d) => d.id);

    const form7List = await prisma.form7.findMany({
      where: {
        district_id: { in: districtIds },
      },
      orderBy: { created_at: "desc" },
    });

    return form7List;
  }

  // NORMAL USER - district-based
  else {
    const user = await Form7Service.getUserDistrict(uid);

    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(user.district_id);

    return form7 ? [form7] : [];
  }
},

  /*EDITABLE FORM7*/
  async editable(uid: number) {
    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(
        user.district_id
      );

    if (!form7) {
      throw { statusCode: 400, message: "Form7 not submitted yet" };
    }

    const societies =
      await Form7Service.getForm7Societies(form7.id);

    return { form7, societies };
  },

  /*EDIT FORM7*/
  async edit(payload: any) {
    const { uid, societies: inputSocieties } = payload;

    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(
        user.district_id
      );
    if (!form7) {
      throw { statusCode: 400, message: "Form7 not found" };
    }

    await Form7Service.deleteForm7Societies(form7.id);

    await Form7Service.createForm7Societies(
      form7.id,
      inputSocieties.map((s: any) => ({
        ...s,
        final_sc_st_dlg_count: s.final_sc_st_dlg_count ?? 0,
        final_women_dlg_count: s.final_women_dlg_count ?? 0,
        final_general_dlg_count: s.final_general_dlg_count ?? 0,
        polling_suspension_count:
          s.polling_suspension_count ?? "NO_ISSUES",
      }))
    );

    return {
      form7_id: form7.id,
      societies_count: inputSocieties.length,
    };
  },

async getForm7Pdf(params: {
  uid: number;
  role: number;
  zone_id?: string;
  res: any;
}) {
  const { uid, role, zone_id, res } = params;

  const list = await Form7Usecase.list({ uid, role, zone_id });

  if (!list || list.length === 0) {
    throw new Error("No Form7 data found");
  }

  const form7 = list[0];

  const societies = await Form7Service.getForm7Societies(form7.id);

  const body: any[] = [];

  /*HEADER*/

  body.push(
    [
      { text: "வ.எண்", rowSpan: 2 },
      { text: "மாவட்ட தேர்தல் அலுவலர் மாவட்டம்/மண்டலம்", rowSpan: 2 },
      { text: "மாவட்ட தேர்தல் அலுவலர் சரகம்", rowSpan: 2 },
      { text: "மாவட்ட தேர்தல் அலுவலர் சரகம்", rowSpan: 2 },

      {
        text: "தேர்ந்தெடுக்கப்பட வேண்டிய நிர்வாகக்குழு இயக்குநர்களின் எண்ணிக்கை",
        colSpan: 4,
        alignment: "center",
      },
      {}, {}, {},

      {
        text: "நிர்வாகக்குழு இயக்குநர் பதவிக்கு போட்டியிடும் இயக்குநர்களின் எண்ணிக்கை",
        colSpan: 4,
        alignment: "center",
      },
      {}, {}, {},

      { text: "வாக்குப்பதிவு நடைபெற்ற சங்கங்களின் பெயர்", rowSpan: 2 },
      { text: "மொத்த வாக்காளர்களின் எண்ணிக்கை", rowSpan: 2 },
      { text: "பதிவான ஓட்டுகளின் எண்ணிக்கை", rowSpan: 2 },
      { text: "வாக்குப்பதிவு (%)", rowSpan: 2 },
      { text: "பயன்படுத்தப்பட்ட வாக்குப்பெட்டிகளின் எணிக்கை", rowSpan: 2 },
      { text: "முத்திரைத் தாள்களின் எண்ணிக்கை", rowSpan: 2 },
      { text: "வாக்குப்பதிவு நடைபெற்ற இடங்களின் எண்ணிக்கை", rowSpan: 2 },
      {
        text: "வாக்குப்பதிவின் போது பயன்படுத்தப்பட்ட தேர்தல் அலுவலர் / உதவியாளர் எண்ணிக்கை",
        rowSpan: 2,
      },
      {
        text: "வாக்குப்பதிவின் போது தேர்தல் நிறுத்தப்பட்ட சங்கங்களின் பெயர்",
        rowSpan: 2,
      },
    ],

    [
      {}, {}, {}, {},

      { text: "ப.இ./ப.கு" },
      { text: "பெண்கள்" },
      { text: "பொது" },
      { text: "மொத்தம்" },

      { text: "ப.இ./ப.கு" },
      { text: "பெண்கள்" },
      { text: "பொது" },
      { text: "மொத்தம்" },

      {}, {}, {}, {}, {}, {}, {}, {}, {}
    ]
  );

  /*ROWS*/

  let index = 1;

  for (const s of societies) {
    const total1 =
      (s.final_sc_st_count || 0) +
      (s.final_women_count || 0) +
      (s.final_general_count || 0);

    const total2 =
      (s.final_sc_st_dlg_count || 0) +
      (s.final_women_dlg_count || 0) +
      (s.final_general_dlg_count || 0);

body.push([
  String(index++),
  String(form7.district_name || "-"),
  "-",
  "-",

  String(s.final_sc_st_count ?? 0),
  String(s.final_women_count ?? 0),
  String(s.final_general_count ?? 0),
  String(total1),

  String(s.final_sc_st_dlg_count ?? 0),
  String(s.final_women_dlg_count ?? 0),
  String(s.final_general_dlg_count ?? 0),
  String(total2),

  String(s.society_name || "-"),
  String(s.form3_total ?? 0),
  String(s.casted_votes_count ?? 0),
  String(s.voting_percentage ?? 0),  
  String(s.ballot_box_count ?? 0),
  String(s.stamp_count ?? 0),
  String(s.polling_stations_count ?? 0),
  String(s.election_officers_count ?? 0),
  String(s.polling_suspension_count || "-"),
]);
  }

  /*PDF*/

  const docDefinition = {
    pageOrientation: "landscape",
    pageSize: "A4",

    content: [
      {
        text:
          "வேட்புமனு திரும்ப பெறுதல் மற்றும் இறுதி போட்டியிடும் வேட்பாளர்கள் பற்றிய முழு விவரங்கள்",
        alignment: "center",
        bold: true,
        fontSize: 14,
      },
      {
        text: `துறை -- ${form7.district_name || "-"}`,
        alignment: "center",
        margin: [0, 5, 0, 10],
      },
      {
        table: {
          headerRows: 2,
          widths: new Array(21).fill("auto"),
          body,
        },
        layout: {
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
      },
    ],

    defaultStyle: {
      fontSize: 8,
      // font: "NotoSansTamil" // if configured
    },
  };

  const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");

// attach default fonts (Roboto)
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// ADD THIS BLOCK HERE
pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
  NotoSansTamil: {
    normal: "NotoSansTamil-Regular.ttf",
    bold: "NotoSansTamil-Regular.ttf",
    italics: "NotoSansTamil-Regular.ttf",
    bolditalics: "NotoSansTamil-Regular.ttf",
  },
};
  const pdfDoc = pdfMake.createPdf(docDefinition);

  pdfDoc.getBuffer((buffer: any) => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=form7.pdf"
    );
    res.send(buffer);
  });
},
defaultStyle: {
  font: "NotoSansTamil",
  fontSize: 8,
},

};
