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
/*PDF DOWNLOAD*/
async getForm5Pdf(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  // ✅ get data from service
  const data = await Form5Service.getForm5Pdf({
    uid,
    role,
    zone_id,
  });

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  const rows: any[] = [];
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

          rows.push({
            sno: count++,
            district,
            zone,
            society: societyName,

            // ✅ FIXED: ensure proper keys
            member_name: m?.member_name || "-",
            aadhar: m?.aadhar_no || "-",   // keep this if column key = "aadhar"

            // ✅ Clean category
            category: String(key).toUpperCase(),

            // ✅ Safe declared values
            sc_st: declared?.sc_st ?? 0,
            women: declared?.women ?? 0,
            general: declared?.general ?? 0,
          });
        }
      }
    }
  }

  if (rows.length === 0) {
    throw new Error("No member data found");
  }

  return generatePDF(
    res,
    "வேட்புமனு பரிசீலனை மற்றும் செல்லத்தக்க வேட்புமனுக்கள் பட்டியல்",
    [
      { header: "வ.எண்", key: "sno" },
      { header: "மாவட்டம்", key: "district" },
      { header: "சரகம்", key: "zone" },
      { header: "சங்கம்", key: "society" },
      { header: "உறுப்பினர் பெயர்", key: "member_name" },
      { header: "ஆதார் எண்", key: "aadhar" },
      { header: "பிரிவு", key: "category" },
      { header: "ப.இ./ப.கு", key: "sc_st" },
      { header: "பெண்கள்", key: "women" },
      { header: "பொது", key: "general" },
    ],
    rows
  );
},

};
