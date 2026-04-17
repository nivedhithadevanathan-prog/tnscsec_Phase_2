import {
  form10_status,
  form10_society_status,
  form10_candidate_status_status,
  form10_society_election_type,
} from "@prisma/client";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const Form10Service = {

  /*FORM10 INIT*/

  buildForm10(params: {
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
      status: form10_status.DRAFT,
    };
  },

  buildInitialForm10Society() {
    return {
      election_type: null,
      status: form10_society_status.DRAFT,
    };
  },

  buildInitResponse(params: {
    form10_id: number;
    societies_count: number;
  }) {
    return {
      form10_id: params.form10_id,
      status: form10_status.DRAFT,
      societies_count: params.societies_count,
    };
  },



  /*PREVIEW BUILDER*/
  buildPreview(params: {
    form4_filed_soc_id: number;
    members: {
      id: number;
      member_name: string;
      aadhar_no: string;
      status?: form10_candidate_status_status | null;
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
        aadhar_no: m.aadhar_no,
        status: m.status ?? null,
      };

      switch (row.status) {

        case null:
          pending.push(row);
          break;

        case form10_candidate_status_status.ELIGIBLE:
          eligible.push(row);
          break;

        case form10_candidate_status_status.REJECTED:
          rejected.push(row);
          break;

        case form10_candidate_status_status.WITHDRAWN:
          withdrawn.push(row);
          break;

        case form10_candidate_status_status.LOST:
          lost.push(row);
          break;

        default:
          pending.push(row);
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

/*REJECT*/

  buildRejectCandidateStatus(params: {
    form10_id: number;
    form10_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      form5_member_id: params.form5_member_id,
      status: form10_candidate_status_status.REJECTED,
      remarks: params.remarks ?? null,
    };
  },

  buildRejectResponse(params: {
    rejected_count: number;
  }) {
    return {
      rejected_count: params.rejected_count,
    };
  },

 /*WITHDRAW*/

  buildWithdrawCandidateStatus(params: {
    form10_id: number;
    form10_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      form5_member_id: params.form5_member_id,
      status: form10_candidate_status_status.WITHDRAWN,
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
      return form10_society_election_type.UNOPPOSED;
    }

    return form10_society_election_type.POLL;
  },

  buildFinalSocietyUpdate(params: {
    election_type: form10_society_election_type;
    vice_president_form5_candidate_id?: number | null;
  }) {
    return {
      status: form10_society_status.FINALIZED,
      election_type: params.election_type,
      vice_president_form5_candidate_id:
        params.vice_president_form5_candidate_id ?? null,
    };
  },

  buildFinalResponse(params: {
    form10_id: number;
    form10_society_id: number;
    election_type: form10_society_election_type;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      election_type: params.election_type,
    };
  },

 /*SUBMIT*/

  buildSubmitForm10Update() {
    return {
      status: form10_status.SUBMITTED,
    };
  },

  buildSubmitResponse() {
    return null;
  },

/*(VICE PRESIDENT)*/
buildListSociety(params: {
  form10_society_id: number;
  form4_filed_soc_id: number;
  society_id: number;
  society_name: string;
  election_type: any;
  vice_president_winner: {
    form5_member_id: number;
    member_name: string;
    aadhar_no: string;
  } | null;
  is_draft_visible: boolean;
}) {
  return {
    form10_society_id: params.form10_society_id,
    form4_filed_soc_id: params.form4_filed_soc_id,
    society_id: params.society_id,
    society_name: params.society_name,
    election_type: params.election_type,
    vice_president_winner: params.vice_president_winner,
    draft: params.is_draft_visible === true ? false : true,
  };
},

buildListResponse(params: {
  societies: any[];
}) {
  return params.societies;
},

/*FORM10 PDF*/

  async getForm10Pdf(params: {
    uid: number;
    role: number;
    department_id?: number;
    district_id?: number;
    zone_id?: string;
    res: any;
  }) {

    const { uid, role, department_id, district_id, zone_id, res } = params;

    /*GET FORM10*/

    let form10;

    // ADMIN
    if (role === 1) {
      form10 = await prisma.form10.findFirst({
        orderBy: { id: "desc" },
      });
    }

    // JRCS
    else if (role === 4) {
      const zoneIds = zone_id
        ? zone_id.split(",").map(z => Number(z))
        : [];

      form10 = await prisma.form10.findFirst({
        where: {
          ...(department_id && { department_id }),
          ...(district_id && { district_id }),
          ...(zoneIds.length && { zone_id: { in: zoneIds } }),
        },
        orderBy: { id: "desc" },
      });
    }

    // NORMAL USER
    else {
      form10 = await prisma.form10.findFirst({
        where: { uid },
        orderBy: { id: "desc" },
      });
    }

    if (!form10) {
      throw new Error("No Form10 data found");
    }

    /*FETCH SOCIETIES*/

    const societies = await prisma.form10_society.findMany({
      where: { form10_id: form10.id },
      include: {
        form4_filed_soc_mem_count: true,
        form5: true,
        form10_candidate_status: true,
      },
    });

    /*BUILD TABLE*/

    const body: any[] = [];

    /*HEADER*/
    body.push(
      [
        { text: "வ.எண்", rowSpan: 2 },
        { text: "மாவட்ட தேர்தல் அலுவலர் மாவட்டம்/மண்டலம்", rowSpan: 2 },
        { text: "மாவட்ட தேர்தல் அலுவலர் சரகம்", rowSpan: 2 },
        { text: "வாக்குப்பதிவு நடைபெற்ற சங்கங்களின் பெயர்", rowSpan: 2 },

        { text: "துணைத் தலைவர் தேர்தலுக்கு தாக்கல் செய்யப்பட்ட வேட்பு மனுக்கள்/உறுப்பினர்கள்", colSpan: 4, alignment: "center" },
        {}, {}, {},

        { text: "பரிசீலனையில் நிராகரிக்கப்பட்ட வேட்பு மனுக்கள்/உறுப்பினர்கள்", colSpan: 4, alignment: "center" },
        {}, {}, {},

        { text: "துணைத் தலைவர் பதவிக்கு தகுதியான இறுதி வேட்பாளர் பட்டியல் உறுப்பினர்கள்", colSpan: 4, alignment: "center" },
        {}, {}, {},

        { text: "இறுதியாக தேர்ந்தெடுக்கப்பட்ட துணைத் தலைவரின் பெயர்.", rowSpan: 2 },
        { text: "தேர்தல் வகை", rowSpan: 2 },
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

        { text: "ப.இ./ப.கு" },
        { text: "பெண்கள்" },
        { text: "பொது" },
        { text: "மொத்தம்" },

        {},
        {},
      ]
    );

    /*ROWS*/

    let index = 1;

    for (const soc of societies) {

      const counts = {
        submitted: 0,
        rejected: 0,
        eligible: 0,
      };

      for (const cs of soc.form10_candidate_status) {

        const status = cs.status;

        // submitted = all
        counts.submitted++;

        if (status === "REJECTED") {
          counts.rejected++;
        }

        if (status !== "REJECTED" && status !== "WITHDRAWN") {
          counts.eligible++;
        }
      }

      body.push([
        index++,
        form10.district_id ?? "-",
        "-", // zone placeholder
        soc.form4_filed_soc_mem_count?.society_name ?? "-",

        counts.submitted,
        0,
        0,
        counts.submitted,

        counts.rejected,
        0,
        0,
        counts.rejected,

        counts.eligible,
        0,
        0,
        counts.eligible,

        soc.form5?.member_name ?? "-",
        soc.election_type ?? "-",
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
          text: "வேட்புமனு திரும்ப பெறுதல் மற்றும் இறுதி போட்டியிடும் வேட்பாளர்கள் பற்றிய முழு விவரங்கள்",
          alignment: "center",
          bold: true,
          fontSize: 14,
        },
        {
          text: `துறை -- ${form10.department_id ?? "-"}`,
          alignment: "center",
          margin: [0, 5, 0, 10],
        },
        {
          table: {
            headerRows: 2,
            widths: new Array(18).fill("auto"),
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
        "attachment; filename=form10.pdf"
      );

      res.send(result);
    });

    pdfDoc.end();
  },

};


