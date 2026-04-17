import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { Form8Service } from "../../form8/Services/form8.Service";
import { form5_category_type } from "@prisma/client";
import { ScopeResult } from "../../../utils/resolveScope";
/*PREVIEW API USECASE*/

interface PreviewPayload {
  uid: number;
  district_id: number;
}

export const Form8PreviewUsecase = {
  async preview(payload: PreviewPayload) {
    const { district_id } = payload;

    const societies =
      await Form8Service.getForm7SocietiesByDistrict(district_id);

    const polledSocieties: any[] = [];

    const stoppedElections = {
      RULE_52_18: [] as any[],
      RULE_52A_6: [] as any[],
    };

    for (const soc of societies) {
      const base = {
        form7_society_id: soc.id,
        society_id: soc.society_id,
        society_name: soc.society_name,
        casted_votes_count: soc.casted_votes_count,
        polling_suspension_count: soc.polling_suspension_count,
      };

      if (soc.polling_suspension_count === "RULE_52_18") {
        stoppedElections.RULE_52_18.push(base);
        continue;
      }

      if (soc.polling_suspension_count === "RULE_52A_6") {
        stoppedElections.RULE_52A_6.push(base);
        continue;
      }

      if (soc.polling_suspension_count === "NO_ISSUES") {
        const members =
          await Form8Service.getMembers(soc.id);

        const groupedMembers = {
          SC_ST: [] as any[],
          WOMEN: [] as any[],
          GENERAL: [] as any[],
        };

        for (const m of members) {
          if (m.category_type === form5_category_type.sc_st) {
            groupedMembers.SC_ST.push(m);
          }
          if (m.category_type === form5_category_type.women) {
            groupedMembers.WOMEN.push(m);
          }
          if (m.category_type === form5_category_type.general) {
            groupedMembers.GENERAL.push(m);
          }
        }

        const rural =
          await Form8Service.getRuralCountsBySociety(
            soc.society_id
          );

        polledSocieties.push({
          ...base,
          rural: {
            SC_ST: rural?.rural_sc_st ?? 0,
            WOMEN: rural?.rural_women ?? 0,
            GENERAL: rural?.rural_general ?? 0,
          },
          declared: {
            SC_ST: soc.final_sc_st_count ?? 0,
            WOMEN: soc.final_women_count ?? 0,
            GENERAL: soc.final_general_count ?? 0,
          },
          members: groupedMembers,
        });
      }
    }

    return {
      polled_societies: polledSocieties,
      stopped_elections: stoppedElections,
    };
  },
};

/*CHECKBOX PREVIEW USECASE*/

export const Form8CheckboxUsecase = {
  async checkboxPreview(district_id: number) {
    const societies =
      await Form8Service.getForm7SocietiesByDistrict(district_id);

    const response: any[] = [];

    for (const soc of societies) {
      if (soc.polling_suspension_count !== "NO_ISSUES") continue;

      const members =
        await Form8Service.getMembers(soc.id);

      //FILTER NULL category_type
     const validMembers = members
  .filter((m) => m.category_type !== null)
  .map((m) => ({
    id: m.id,
    category_type: m.category_type as form5_category_type,
  }));


      const seat_limit = {
        SC_ST: soc.final_sc_st_count ?? 0,
        WOMEN: soc.final_women_count ?? 0,
        GENERAL: soc.final_general_count ?? 0,
        
      };

     const preview =
  Form8Service.buildCheckboxPreview({
    form7_society_id: soc.id,
    members: validMembers,
    seat_limit,
  });


      response.push(preview);
    }

    return response;
  },
};

/*FINAL RESULT SAVE USECASE*/

export const Form8FinalResultUsecase = {
  async saveFinalResult(data: {
    uid: number;
    district_id: number;
    payload: {
      form7_society_id: number;
      winners: {
        SC_ST?: number[];
        WOMEN?: number[];
        GENERAL?: number[];
        SC_ST_DLG?: number[];
        WOMEN_DLG?: number[];
        GENERAL_DLG?: number[];
      };
    };
  }) {
    const { district_id, payload } = data;

    const form8 =
      await Form8Service.getOrCreateForm8(district_id);

    const winners = payload.winners;

    const total =
      (winners.SC_ST?.length ?? 0) +
      (winners.WOMEN?.length ?? 0) +
      (winners.GENERAL?.length ?? 0) +
      (winners.SC_ST_DLG?.length ?? 0) +
      (winners.WOMEN_DLG?.length ?? 0) +
      (winners.GENERAL_DLG?.length ?? 0);

    if (total === 0) {
      throw new Error("At least one winner must be selected");
    }

    await Form8Service.saveFinalResult({
      form8_id: form8.id,
      form7_society_id: payload.form7_society_id,
      winners,
    });

    return {
      form8_id: form8.id,
      total,
    };
  },
};

/*SUBMIT FORM8 USECASE*/

interface SubmitPayload {
  uid: number;
  district_id: number;
  societies: {
    form7_society_id: number;
    polling_details: {
      ballot_votes_at_counting: number;
      valid_votes: number;
      invalid_votes: number;
      remarks?: string;
    };
  }[];
}

export const Form8SubmitUsecase = {
  async submit(data: SubmitPayload) {
    const { district_id, societies } = data;

    const form8 =
      await Form8Service.getLatestForm8ByDistrict(district_id);

    if (!form8) {
      throw new Error("Form8 not found");
    }

    return await Form8Service.submitForm8(
      form8.id,
      societies
    );
  },
};

/*FORM8 LIST USECASE*/

interface Form8ListPayload {
  uid: number;
  district_id: number;
}

/*FORM8 LIST USECASE*/

export const Form8ListUsecase = {

  async list(params: { uid: number; role: number }) {

    const { uid, role } = params;

    /*ADMIN*/
    if (role === 1) {

      const form8 = await prisma.form8.findFirst({
        orderBy: { id: "desc" },
      });

      if (!form8) return [];

      return Form8Service.getSubmittedForm8Details(
        form8.district_id
      );
    }

    /*JRCS*/
    if (role === 4) {

      const user = await prisma.users.findFirst({
        where: { id: uid },
        select: { zone_id: true },
      });

      if (!user?.zone_id) return [];

      let zoneIds: number[] = [];

      try {
        zoneIds = JSON.parse(user.zone_id);
      } catch (err) {
        console.log("Invalid zone_id format:", user.zone_id);
        return [];
      }

      if (!zoneIds.length) return [];

      // Get districts under these zones
      const districts = await prisma.district.findMany({
        where: {
          zone_id: { in: zoneIds },
        },
        select: { id: true },
      });

      const districtIds = districts.map(d => d.id);

      if (!districtIds.length) return [];

      let finalResult: any[] = [];

      // Fetch Form8 for ALL districts
      for (const dId of districtIds) {
        const data =
          await Form8Service.getSubmittedForm8Details(dId);

        if (Array.isArray(data)) {
          finalResult.push(...data);
        }
      }

      return finalResult;
    }

    /*NORMAL USER*/
    const user = await prisma.users.findFirst({
      where: { id: uid },
      select: { district_id: true },
    });

    if (!user?.district_id) {
      throw {
        statusCode: 400,
        message: "User district not found",
      };
    }

    return Form8Service.getSubmittedForm8Details(
      user.district_id
    );
  },

async getForm8Pdf(params: {
  uid: number;
  role: number;
  res: any;
}) {
  const { uid, role, res } = params;

  const list = await Form8Service.listForm8({ uid, role });

  if (!list || list.length === 0) {
    throw new Error("No Form8 data found");
  }

  const form8 = list[0];

  const body: any[] = [];

  /*HEADER*/

  body.push(
    [
      { text: "வ.எண்", rowSpan: 2 },
      { text: "மாவட்ட தேர்தல் அலுவலர் மாவட்டம்/மண்டலம்", rowSpan: 2 },
      { text: "மாவட்ட தேர்தல் அலுவலர் சரகம்", rowSpan: 2 },
      { text: "வாக்குப்பதிவு நடைபெற்ற சங்கங்களின் பெயர்", rowSpan: 2 },
      { text: "மொத்த பதிவான வாக்குகள்", rowSpan: 2 },
      {
        text: "வாக்கு எண்ணிக்கையின் போது வாக்குப்பெட்டியில் இருந்த வாக்குகளின் எண்ணிக்கை",
        rowSpan: 2,
      },
      { text: "செல்லுபடியான வாக்குகளின் எண்ணிக்கை", rowSpan: 2 },
      { text: "செல்லுபடியாகாத வாக்குகளின் எண்ணிக்கை", rowSpan: 2 },

      {
        text: "வாக்குப்பதிவின் மூலம் தேர்ந்தெடுக்கப்பட்ட நிர்வாகக்குழு உறுப்பினர்கள் பெயர்",
        colSpan: 3,
        alignment: "center",
      },
      {}, {},

      {
        text: "வாக்குப்பதிவின் மூலம் தேர்ந்தெடுக்கப்பட்ட நிர்வாகக்குழு உறுப்பினர்கள் எண்ணிக்கை",
        colSpan: 4,
        alignment: "center",
      },
      {}, {}, {},

      { text: "குறிப்பு", rowSpan: 2 },
    ],

    [
      {}, {}, {}, {}, {}, {}, {}, {},

      { text: "ப.இ./ப.கு" },
      { text: "பெண்கள்" },
      { text: "பொது" },

      { text: "ப.இ./ப.கு" },
      { text: "பெண்கள்" },
      { text: "பொது" },
      { text: "மொத்தம்" },

      {},
    ]
  );

  /*ROWS*/

  let index = 1;

  for (const soc of form8.societies || []) {
    const sc = soc.categories?.SC_ST?.length || 0;
    const women = soc.categories?.WOMEN?.length || 0;
    const general = soc.categories?.GENERAL?.length || 0;

    const total = sc + women + general;

    body.push([
      String(index++),
      String(form8.district_name || "-"),
      "-", // zone
      String(soc.society_name || "-"),

      String(soc.polling_details?.ballot_votes_at_counting ?? 0),
      String(soc.polling_details?.ballot_votes_at_counting ?? 0), // keep if same field
      String(soc.polling_details?.valid_votes ?? 0),
      String(soc.polling_details?.invalid_votes ?? 0),

      // names
      (soc.categories?.SC_ST || []).map((m: any) => m.name).join(", "),
      (soc.categories?.WOMEN || []).map((m: any) => m.name).join(", "),
      (soc.categories?.GENERAL || []).map((m: any) => m.name).join(", "),

      String(sc),
      String(women),
      String(general),
      String(total),

      String(soc.polling_details?.remarks || "-"),
    ]);
  }

  /*PDF*/

  const PdfPrinter = require("pdfmake");

  const fonts = {
    NotoSansTamil: {
      normal: "src/fonts/NotoSansTamil-Regular.ttf",
      bold: "src/fonts/NotoSansTamil-Bold.ttf",
      italics: "src/fonts/NotoSansTamil-Regular.ttf",
      bolditalics: "src/fonts/NotoSansTamil-Bold.ttf",
    },
  };

  const printer = new PdfPrinter(fonts);

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
        text: `துறை -- ${form8.district_name || "-"}`,
        alignment: "center",
        margin: [0, 5, 0, 10],
      },
      {
        table: {
          headerRows: 2,

          widths: [
            30,
            120,
            120,
            150,
            90,
            120,
            120,
            120,
            120,
            120,
            120,
            80,
            80,
            80,
            80,
            120,
          ],

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
      font: "NotoSansTamil",
      fontSize: 8,
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const chunks: any[] = [];

  pdfDoc.on("data", (chunk: any) => chunks.push(chunk));

  pdfDoc.on("end", () => {
    const result = Buffer.concat(chunks);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=form8.pdf"
    );

    res.send(result);
  });

  pdfDoc.end();
},
};

