import { Form5Service } from "../../form5/Services/form5.Service";
import { generatePDF } from "../../../utils/pdfGenerator";

export const Form5Usecase = {
  /*GET Eligible societies for Form5*/
  getEligibleSocietiesByUser(uid: number) {
    return Form5Service.getEligibleSocietiesByUser(uid);
  },

  /*POST Submit Form5*/
  submitMembers(payload: {
    uid: number;
    members: any[];
  }) {
    return Form5Service.submitMembers(payload);
  },

 /*GET Form5 list*/
getForm5ListByUser(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
}) {

  const { uid, role, zone_id } = params;

  return Form5Service.getForm5ListByUser({
    uid,
    role,
    zone_id, 
  });
},


  /*GET Editable Form5*/
  getEditableForm5(uid: number) {
    return Form5Service.getEditableForm5(uid);
  },

  /*PUT Edit Form5*/
  editForm5(payload: {
    uid: number;
    members: any[];
  }) {
    return Form5Service.editForm5(payload);
  },


/*PDF DOWNLOAD*/
async getForm5Pdf(params: {
  uid: number;
  role: number;
  zone_id?: string;
  res: any;
}) {
  const { uid, role, zone_id, res } = params;

  const data = await Form5Service.getForm5Pdf({
    uid,
    role,
    zone_id,
  });

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  const body: any[] = [];

  /*HEADER*/

  body.push(
    [
      { text: "வ.எண்", rowSpan: 2, alignment: "center" },

      {
        text: "மாவட்ட தேர்தல் அலுவலர் /\nமாவட்டம்",
        rowSpan: 2,
        alignment: "center",
      },

      {
        text: "மாவட்ட தேர்தல் அலுவலர்\nசரகம்",
        rowSpan: 2,
        alignment: "center",
      },

      {
        text: "வேட்புமனு தாக்கல் செய்த உறுப்பினர்களின் பெயர் மற்றும் ஆதார் எண் விபரங்களை பதிவு செய்க",
        colSpan: 4,
        alignment: "center",
      },
      {}, {}, {},

      {
        text: "வேட்புமனு தாக்கல் செய்யப்பட்ட சங்கங்கள் மற்றும் உறுப்பினர்களின் எண்ணிக்கை",
        colSpan: 3,
        alignment: "center",
      },
      {},
      {},
    ],

    [
      {}, {}, {},

      { text: "சங்கங்கள்", alignment: "center" },
      { text: "உறுப்பினர் பெயர்", alignment: "center" },
      { text: "ஆதார் எண்", alignment: "center" },
      { text: "பிரிவு", alignment: "center" },

      { text: "ப.இ./ப.கு", alignment: "center" },
      { text: "பெண்கள்", alignment: "center" },
      { text: "பொது", alignment: "center" },
    ]
  );

  /*ROWS*/

  let count = 1;

  for (const item of data) {
    const district = item?.form4?.district_name || "-";
    const zone = item?.form4?.zone_name || "-";

    for (const soc of item.societies || []) {
      const societyName = soc?.society_name || "-";
      const declared = soc?.declared || {};

      for (const key of Object.keys(soc.members || {})) {
        const members = soc.members[key] || [];

        for (const m of members) {
          body.push([
            count++,
            district,
            zone,

            societyName,
            m?.member_name || "-",
            m?.aadhar_no || "-",
            String(key).toUpperCase(),

            declared?.sc_st ?? 0,
            declared?.women ?? 0,
            declared?.general ?? 0,
          ]);
        }
      }
    }
  }

  if (body.length <= 2) {
    throw new Error("No member data found");
  }

  /*PDF*/

  const docDefinition = {
    pageOrientation: "landscape",
    pageSize: "A4",

    content: [
      {
        text: "வேட்புமனு பரிசீலனை மற்றும் செல்லத்தக்க வேட்புமனுக்கள் பட்டியல்",
        style: "header",
      },
      {
        text: `துறை -- ${data[0]?.form4?.district_name || "-"}`,
        style: "subheader",
      },
      {
        table: {
          headerRows: 2,
          widths: [
            30,
            140,
            140,
            160,
            160,
            120,
            100,
            70,
            70,
            70,
          ],
          body,
        },
      },
    ],

    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: "center",
      },
      subheader: {
        fontSize: 11,
        margin: [0, 5, 0, 10],
        alignment: "center",
      },
    },

    defaultStyle: {
      fontSize: 9,
    },
  };

  const pdfMake = require("pdfmake/build/pdfmake");
  const pdfFonts = require("pdfmake/build/vfs_fonts");

  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const pdfDoc = pdfMake.createPdf(docDefinition);

  pdfDoc.getBuffer((buffer: any) => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=form5.pdf"
    );
    res.send(buffer);
  });
},

};
