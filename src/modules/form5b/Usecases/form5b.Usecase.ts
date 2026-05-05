import fs from "fs";
import path from "path";
import { generateHtmlPdf } from "../../../utils/pupeteerpdfGenerator";
import { Form5BService } from "../Services/form5b.Service";

export const Form5BUsecase = {

  /*GET Form5B Preview*/
  getPreview(uid: number) {
    return Form5BService.getPreview(uid);
  },

  /*POST Stop Societies*/
  stopSocieties(payload: {
    uid: number;
    societies: any[];
  }) {
    return Form5BService.stopSocieties(payload);
  },

stopCandidates(payload: {
  uid: number;
  candidates: any[];
}) {
  return Form5BService.stopCandidates(payload);
},

submitForm5B(uid: number) {
  return Form5BService.submitForm5B(uid);
},

/*GET Form5B list*/
getForm5BListByUser(params: { uid: number; role: number; zone_id?: string; }) {

  const { uid, role, zone_id } = params;

  return Form5BService.getForm5BListByUser({
    uid,
    role,
    zone_id,  
  });

},

/*GET Editable Form5B*/
getEditableForm5BByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form5BService.getEditableForm5BByUser({
    uid,
    role,
  });

},

/*PUT Edit Form5B*/
editForm5B(payload: {
  uid: number;
  role: number;
  societies: any[];
  candidates: any[];
}) {
  return Form5BService.editForm5B(payload);
},

async getForm5BPdf(params: {
  uid: number;
  role: number;
  zone_id?: string;
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  const data = await Form5BService.getForm5BPdf({
    uid,
    role,
    zone_id,
  });

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  let count = 1;
  let rows = "";

  for (const item of data) {

    const district = item.form4?.district_name || "-";
    const zone = item.form4?.zone_name || "-";

    for (const soc of item.societies || []) {

      const sc = soc.members?.sc_st || [];
      const women = soc.members?.women || [];
      const general = soc.members?.general || [];

      const activeSc = sc.filter((m: any) => m.is_active);
      const activeWomen = women.filter((m: any) => m.is_active);
      const activeGeneral = general.filter((m: any) => m.is_active);

      rows += `
        <tr>
          <td>${count++}</td>
          <td>${district}</td>
          <td>${zone}</td>

          <!-- Declared -->
          <td>1</td>
          <td>${sc.length}</td>
          <td>${women.length}</td>
          <td>${general.length}</td>
          <td>${sc.length}</td>
          <td>${women.length}</td>
          <td>${general.length}</td>

          <!-- Remaining -->
          <td>${activeSc.length}</td>
          <td>${activeWomen.length}</td>
          <td>${activeGeneral.length}</td>
          <td>${activeSc.length}</td>
          <td>${activeWomen.length}</td>
          <td>${activeGeneral.length}</td>

          <!-- Stopped -->
          <td>${soc.is_stopped ? soc.society_name : "-"}</td>
        </tr>
      `;
    }
  }

  const htmlPath = path.join(
    process.cwd(),
    "src",
    "utils",
    "templates",
    "form5b.html"
  );

  let html = fs.readFileSync(htmlPath, "utf-8");

  html = html
    .replace("{{rows}}", rows)
    .replace("{{department_name}}", "Cooperative Department");

  return generateHtmlPdf(res, html, "Form5B_Report");
},
};