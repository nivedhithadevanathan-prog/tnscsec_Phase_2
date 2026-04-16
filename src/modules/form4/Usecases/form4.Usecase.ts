import { Form4Service } from "../../form4/Services/form4.Service";
import fs from "fs";
import path from "path";
import { generateHtmlPdf } from "../../../utils/pupeteerpdfGenerator";
export const Form4Usecase = {

  /*Load Form4 base data*/
  loadForm4(uid: number) {
    return Form4Service.loadForm4(uid);
  },

  /*Checkbox preview*/
  checkboxUpdate(uid: number, selectedIds: number[]) {
    return Form4Service.getCheckboxPreview(uid, selectedIds);
  },

  /*Submit Form4*/
  submitForm4(payload: any) {
    return Form4Service.submitForm4(payload);
  },

  /*List all Form4*/
  getForm4ListByUser(params: { 
    uid: number; 
    role: number; 
    zone_id?: string; 
  }) {

    const { uid, role, zone_id } = params;

    return Form4Service.getForm4ListByUser({
      uid,
      role,
      zone_id, 
    });
  },

  /*Get Form4 details*/
  getForm4Details(form4_id: number) {
    return Form4Service.getForm4Details(form4_id);
  },

  /*Editable Form4*/
  getEditableForm4(uid: number) {
    return Form4Service.getEditableForm4(uid);
  },

  /*Edit Form4*/
  editForm4(payload: any) {
    return Form4Service.editForm4(payload);
  },


  async getForm4Pdf(payload: {
    uid: number;
    role: number;
    zone_id?: string;
    res: any;
  }) {

    const { uid, role, zone_id, res } = payload;

    /* -------------------- GET DATA -------------------- */
    const list = await this.getForm4ListByUser({
      uid,
      role,
      zone_id,
    });

    if (!list || list.length === 0) {
      throw new Error("No data found");
    }

    /* -------------------- LOAD HTML TEMPLATE -------------------- */
    const templatePath = path.join(
      __dirname,
      "../../../utils/templates/form4.html"
    );

    let html = fs.readFileSync(templatePath, "utf-8");

    /* -------------------- REPLACE HEADER DATA -------------------- */
    html = html.replace(
      "{{department_name}}",
      list[0]?.form4?.district_name || "-"
    );

    /* -------------------- BUILD ROWS -------------------- */
    let rowsHtml = "";
    let index = 1;

    for (const item of list) {

      const form = item.form4;
      const societies = item.filedList || [];

      /* ---------- CALCULATIONS ---------- */

      const planned_societies = societies.length;

      const planned_scst = societies.reduce((sum: number, s: any) => sum + (s.rural_sc_st || 0), 0);
      const planned_women = societies.reduce((sum: number, s: any) => sum + (s.rural_women || 0), 0);
      const planned_general = societies.reduce((sum: number, s: any) => sum + (s.rural_general || 0), 0);
      const planned_scst_dlg = societies.reduce((sum: number, s: any) => sum + (s.rural_sc_st_dlg || 0), 0);
      const planned_women_dlg = societies.reduce((sum: number, s: any) => sum + (s.rural_women_dlg || 0), 0);
      const planned_general_dlg = societies.reduce((sum: number, s: any) => sum + (s.rural_general_dlg || 0), 0);

      const filed_societies = societies.filter((s: any) => s.is_filed).length;

      const filed_scst = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_sc_st || 0) : 0), 0);
      const filed_women = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_women || 0) : 0), 0);
      const filed_general = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_general || 0) : 0), 0);
      const filed_scst_dlg = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_sc_st_dlg || 0) : 0), 0);
      const filed_women_dlg = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_women_dlg || 0) : 0), 0);
      const filed_general_dlg = societies.reduce((sum: number, s: any) => sum + (s.is_filed ? (s.declared_general_dlg || 0) : 0), 0);

      /* ---------- ROW HTML ---------- */

      rowsHtml += `
        <tr>
          <td>${index++}</td>
          <td>${form?.district_name || "-"}</td>
          <td>${form?.zone_name || "-"}</td>

          <td>${planned_societies}</td>
          <td>${planned_scst}</td>
          <td>${planned_women}</td>
          <td>${planned_general}</td>
          <td>${planned_scst_dlg}</td>
          <td>${planned_women_dlg}</td>
          <td>${planned_general_dlg}</td>
          <td>${planned_scst + planned_women + planned_general}</td>

          <td>${filed_societies}</td>
          <td>${filed_scst}</td>
          <td>${filed_women}</td>
          <td>${filed_general}</td>
          <td>${filed_scst_dlg}</td>
          <td>${filed_women_dlg}</td>
          <td>${filed_general_dlg}</td>
          <td>${filed_scst + filed_women + filed_general}</td>
        </tr>
      `;
    }

    /* -------------------- INJECT ROWS -------------------- */
    html = html.replace("{{rows}}", rowsHtml);

    /* -------------------- GENERATE PDF -------------------- */
    return generateHtmlPdf(
      res,
      html,
      "form4-report"
    );
  },

};