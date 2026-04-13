import { Form4Service } from "../../form4/Services/form4.Service";
import { generatePDF } from "../../../utils/pdfGenerator";
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
async getForm4Pdf(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  const data = await Form4Service.getForm4Pdf({
    uid,
    role,
    zone_id,
  });

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  return generatePDF(
    res,
    "வேட்புமனு தாக்கல் பற்றிய விபரங்கள்",
    [
      { header: "வ.எண்", key: "sno" },
      { header: "மாவட்டம்", key: "district" },
      { header: "சங்கம்", key: "society" },
      { header: "ப.இ./ப.கு", key: "sc_st" },
      { header: "பெண்கள்", key: "women" },
      { header: "பொது", key: "general" },
    ],
    data.map((item: any, index: number) => ({
      sno: index + 1,
      district: item.form4.district_name,
      society: item.filedList?.[0]?.society_name || "-",
      sc_st: item.filedList?.[0]?.declared_sc_st || 0,
      women: item.filedList?.[0]?.declared_women || 0,
      general: item.filedList?.[0]?.declared_general || 0,
    }))
  );
},
};