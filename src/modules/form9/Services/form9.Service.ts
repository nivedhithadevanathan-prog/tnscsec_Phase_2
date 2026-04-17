import {
  form9_status,
  form9_society_status,
  form9_candidate_status_status,
  form9_society_election_type,
} from "@prisma/client";
import { Form9Usecase } from "../Usecases/form9.Usecase";

export const Form9Service = {

  /*PREVIEW BUILDER*/
  buildPreview(params: {
    form4_filed_soc_id: number;
    members: {
      id: number;
      member_name: string;
      aadhar_no: string;
      status?: form9_candidate_status_status | null;
    }[];
  }) {
    const pending: any[] = [];
    const eligible: any[] = [];
    const rejected: any[] = [];
    const withdrawn: any[] = [];
    const lost: any[] = [];

    params.members.forEach(m => {
      const row = {
        form5_member_id: m.id,
        member_name: m.member_name,
        aadhaar_name: m.aadhar_no,
        status: m.status ?? null,
      };

      switch (row.status) {
        case null:
          pending.push(row);
          break;

        case form9_candidate_status_status.ELIGIBLE:
          eligible.push(row);
          break;

        case form9_candidate_status_status.REJECTED:
          rejected.push(row);
          break;

        case form9_candidate_status_status.WITHDRAWN:
          withdrawn.push(row);
          break;

        case form9_candidate_status_status.LOST:
          lost.push(row);
          break;
      }
    });

    return {
      form4_filed_soc_id: params.form4_filed_soc_id,
      pending,
      eligible,
      rejected,
      withdrawn,
      lost,
    };
  },

  /*FORM9 INIT*/
 buildForm9(params: {
  uid: number;
  district_id: number | null;
  zone_id?: number | null;
  department_id?: number | null;
}) {

    return {
      uid: params.uid,
      district_id: params.district_id ?? null,
      zone_id: params.zone_id ?? null,
      department_id: params.department_id ?? null,
      status: form9_status.DRAFT,
    };
  },

  buildInitialForm9Society() {
  return {
    election_type: null,
    status: form9_society_status.DRAFT,
  };
},


  buildInitResponse(params: {
    form9_id: number;
    societies_count: number;
  }) {
    return {
      form9_id: params.form9_id,
      status: form9_status.DRAFT,
      societies_count: params.societies_count,
    };
  },

  /*REJECT*/
  buildRejectCandidateStatus(params: {
    form9_id: number;
    form9_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      form5_member_id: params.form5_member_id,
      status: form9_candidate_status_status.REJECTED,
      remarks: params.remarks ?? null,
    };
  },

  buildRejectResponse() {
    return null;
  },

  /*WITHDRAW*/
  buildWithdrawCandidateStatus(params: {
    form9_id: number;
    form9_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      form5_member_id: params.form5_member_id,
      status: form9_candidate_status_status.WITHDRAWN,
      remarks: params.remarks ?? null,
    };
  },

  buildWithdrawResponse() {
    return null;
  },

  /*FINAL SOCIETY*/
  decideElectionType(activeCandidatesCount: number) {
    if (activeCandidatesCount <= 0) {
      throw {
        statusCode: 400,
        message: "No active candidates found",
      };
    }

    if (activeCandidatesCount === 1) {
      return form9_society_election_type.UNOPPOSED;
    }

    return form9_society_election_type.POLL;
  },

  buildFinalSocietyUpdate(params: {
    election_type: form9_society_election_type;
    president_form5_candidate_id?: number | null;
  }) {
    return {
      status: form9_society_status.FINALIZED,
      election_type: params.election_type,
      president_form5_candidate_id:
        params.president_form5_candidate_id ?? null,
    };
  },

  buildFinalResponse(params: {
    form9_id: number;
    form9_society_id: number;
    election_type: form9_society_election_type;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      election_type: params.election_type,
    };
  },

  /*SUBMIT*/
  buildSubmitForm9Update() {
    return {
      status: form9_status.SUBMITTED,
    };
  },

  buildSubmitResponse() {
    return null;
  },

 /* LIST (WINNERS) */
buildListSociety(params: {
  form9_society_id: number;
  form4_filed_soc_id: number;
  society_id: number;
  society_name: string;
  election_type: form9_society_election_type;
  president_winner: {
    form5_member_id: number;
    member_name: string;
    aadhar_no: string;
  } | null;
  is_draft_visible: boolean;
}) {
  return {
    form9_society_id: params.form9_society_id,
    form4_filed_soc_id: params.form4_filed_soc_id,
    society_id: params.society_id,
    society_name: params.society_name,
    election_type: params.election_type,
    president_winner: params.president_winner,
    draft: params.is_draft_visible === true ? false : true,
  };
},

buildListResponse(params: {
  societies: any[];
}) {
  return params.societies;
},

/*FORM9 PDF SERVICE*/

async getForm9Pdf(params: {
    uid: number;
    role: number;
    department_id?: number;
    district_id?: number;
    zone_id?: string;
    res: any;
  }) {
    const { uid, role, department_id, district_id, zone_id, res } = params;

    /*GET DATA*/

    const list = await Form9Usecase.list({
      uid,
      role,
      department_id,
      district_id,
      zone_id,
    });

    if (!list || list.length === 0) {
      throw new Error("No Form9 data found");
    }

    /*BUILD TABLE*/

    const body: any[] = [];

    /* HEADER */

    body.push(
      [
        { text: "வ.எண்", rowSpan: 2 },
        { text: "மாவட்ட தேர்தல் அலுவலர் மாவட்டம்/மண்டலம்", rowSpan: 2 },
        { text: "மாவட்ட தேர்தல் அலுவலர் சரகம்", rowSpan: 2 },
        { text: "தலைவர் தேர்தல் நடைபெற வேண்டிய சங்கத்தின் பெயர்", rowSpan: 2 },

        {
          text: "தாக்கல் செய்யப்பட்ட வேட்பாளர்கள்",
          colSpan: 4,
          alignment: "center",
        },
        {}, {}, {},

        {
          text: "இறுதி தகுதி பெற்ற வேட்பாளர்கள்",
          colSpan: 4,
          alignment: "center",
        },
        {}, {}, {},

        {
          text: "இறுதியாக தேர்ந்தெடுக்கப்பட்ட தலைவர்",
          rowSpan: 2,
        },
        {
          text: "தேர்தல் வகை",
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

        {}, {},
      ]
    );

    /*ROWS*/

    let index = 1;

    for (const soc of list) {
      // We don’t have category split from list → so safe fallback
      const totalSubmitted = 1; // adjust if needed
      const totalEligible = 1; // adjust if needed

      body.push([
        String(index++),
        "-", // district (you can map later)
        "-", // zone
        String(soc.society_name || "-"),

        // submitted (fallback)
        "1",
        "0",
        "0",
        String(totalSubmitted),

        // eligible (fallback)
        "1",
        "0",
        "0",
        String(totalEligible),

        String(soc.president_winner?.member_name || "-"),
        String(soc.election_type || "-"),
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
          text: "துறை",
          alignment: "center",
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            headerRows: 2,
            widths: new Array(14).fill("auto"),
            body,
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
        "attachment; filename=form9.pdf"
      );

      res.send(result);
    });

    pdfDoc.end();
  },
};
