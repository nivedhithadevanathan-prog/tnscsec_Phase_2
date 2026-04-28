import { Form5Service } from "../../form5/Services/form5.Service";
import fs from "fs";
import path from "path";
import { generateHtmlPdf } from "../../../utils/pupeteerpdfGenerator";
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

  /* LOAD TEMPLATE */
  const templatePath = path.join(
    __dirname,
    "../../../utils/templates/form5.html"
  );

  let html = fs.readFileSync(templatePath, "utf-8");

  /* HEADER */
  html = html.replace(
    "{{department_name}}",
    data[0]?.form4?.district_name || "-"
  );

  /* CATEGORY MAP (🔥 IMPORTANT) */
  const categoryMap: any = {
    sc_st: "ப.இ./ப.கு",
    women: "பெண்கள்",
    general: "பொது",
    sc_st_dlg: "ப.இ./ப.கு_பிரதிநிதி",
    women_dlg: "பெண்கள்_பிரதிநிதி",
    general_dlg: "பொது_பிரதிநிதி",
  };

  /* BUILD ROWS */
  let rows = "";
  let count = 1;

  for (const item of data) {
    const district = item.form4?.district_name || "-";
    const zone = item.form4?.zone_name || "-";

    for (const soc of item.societies || []) {
      const declared = soc.declared || {};

      for (const key of Object.keys(soc.members || {})) {
        const members = soc.members[key] || [];

        for (const m of members) {

          const categoryTamil = categoryMap[key] || "-";

          rows += `
            <tr>
              <td>${count++}</td>
              <td>${district}</td>
              <td>${zone}</td>
              <td>${soc.society_name}</td>
              <td>${m.member_name}</td>
              <td>${m.aadhar_no}</td>

              <!-- ✅ SINGLE CATEGORY -->
              <td>${categoryTamil}</td>

              <!-- COUNTS -->
              <td>${declared.sc_st ?? 0}</td>
              <td>${declared.women ?? 0}</td>
              <td>${declared.general ?? 0}</td>
            </tr>
          `;
        }
      }
    }
  }

  if (!rows) {
    throw new Error("No rows to render");
  }

  html = html.replace("{{rows}}", rows);

  /* GENERATE PDF */
  return generateHtmlPdf(res, html, "form5-report");
},

};
