import { Form6Service } from "../../form6/Services/form6.Service";
import fs from "fs";
import path from "path";
import { generateHtmlPdf } from "../../../utils/pupeteerpdfGenerator";

export const Form6Usecase = {

  initForm6(uid: number) {
    return Form6Service.initForm6(uid);
  },

  loadForm6Preview(uid: number) {
    return Form6Service.loadForm6Preview(uid);
  },

  getEditableForm6(uid: number) {
    return Form6Service.getEditableForm6(uid);
  },
/*LIST FORM-6*/
listForm6(params: { uid: number; role: number; zone_id?: string }) {

  const { uid, role, zone_id } = params;

  return Form6Service.listForm6({
    uid,
    role,
    zone_id,
  });
},

  withdrawCandidate(payload: {
    uid: number;
    form4_filed_soc_id: number;
    form5_member_id: number;
  }) {
    return Form6Service.withdrawCandidate(payload);
  },

  societyDecision(payload: {
    uid: number;
    form4_filed_soc_id: number;
    election_action: "SHOW" | "STOP";
  }) {
    return Form6Service.societyDecision(payload);
  },

  editForm6(payload: {
    uid: number;
    societies: {
      form4_filed_soc_id: number;
      election_action: "SHOW" | "STOP";
    }[];
  }) {
    return Form6Service.editForm6(payload);
  },

  submitForm6(uid: number) {
    return Form6Service.submitForm6(uid);
  },

/*PDF DOWNLOAD*/

async getForm6Pdf(params: {
  uid: number;
  role: number;
  zone_id?: string;
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  const { form4, societies, members, events } =
    await Form6Service.getForm6FullPdfData({
      uid,
      role,
      zone_id,
    });

  if (!form4 || !societies?.length) {
    throw new Error("No Form6 data found");
  }

  let count = 1;

  let rows_page1 = ""; // FIRST 3 GROUPS
  let rows_page2 = ""; // LAST 2 GROUPS

  for (const soc of societies) {

    const socMembers = members.filter(
      (m: any) => m.form4_filed_soc_id === soc.id
    );

    const withdrawn = socMembers.filter((m: any) =>
      events.some((e: any) =>
        e.form5_member_id === m.id &&
        e.event_type === "WITHDRAW"
      )
    );

    const active = socMembers.filter(
      (m: any) => !withdrawn.find((w: any) => w.id === m.id)
    );

    const countBy = (list: any[], type: string) =>
      list.filter(m => m.category_type === type).length;

    // ================= PAGE 1 =================
    rows_page1 += `
      <tr>
        <td>${count}</td>
        <td>${form4.district_name}</td>
        <td>${form4.zone_name}</td>

        <!-- Withdrawal (8 cols) -->
        <td>${soc.society_name}</td>
        <td>${countBy(withdrawn, "sc_st")}</td>
        <td>${countBy(withdrawn, "women")}</td>
        <td>${countBy(withdrawn, "general")}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>${withdrawn.length}</td>

        <!-- Final (8 cols) -->
        <td>${soc.society_name}</td>
        <td>${countBy(active, "sc_st")}</td>
        <td>${countBy(active, "women")}</td>
        <td>${countBy(active, "general")}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>${active.length}</td>

        <!-- Equal (8 cols) -->
        <td>${soc.society_name}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
      </tr>
    `;

    // ================= PAGE 2 =================
    rows_page2 += `
      <tr>
        <td>${count}</td>
        <td>${form4.district_name}</td>
        <td>${form4.zone_name}</td>

        <!-- Less (8 cols) -->
        <td>${soc.society_name}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>

        <!-- 5th Block (8 cols) -->
        <td>${soc.society_name}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
      </tr>
    `;

    count++;
  }

  // 📌 Load HTML
  const htmlPath = path.join(
    process.cwd(),
    "src",
    "utils",
    "templates",
    "form6.html"
  );

  let html = fs.readFileSync(htmlPath, "utf-8");

  // ✅ CORRECT PLACEHOLDER MATCH
  html = html
    .replace("{{rows_page1}}", rows_page1)
    .replace("{{rows_page2}}", rows_page2)
    .replace("{{department_name}}", "Cooperative Department");

  return generateHtmlPdf(res, html, "Form6_Report");
},
};


