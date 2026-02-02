import { Form4Service } from "./form4Service";

export const Form4Usecase = {
  loadForm4(uid: number) {
    return Form4Service.loadForm4(uid);
  },

  checkboxUpdate(uid: number, selectedIds: number[]) {
    return Form4Service.getCheckboxPreview(uid, selectedIds);
  },

  submitForm4(payload: any) {
    return Form4Service.submitForm4(payload);
  },

  getForm4Details(form4_id: number) {
    return Form4Service.getForm4Details(form4_id);
  },
  listForm4(uid: number) {
  return Form4Service.listForm4(uid);
},
 async getEditableForm4(uid: number) {
    return Form4Service.getEditableForm4(uid);
  },

  async editForm4(payload: any) {
    // reuse submitForm4 logic
    return Form4Service.submitForm4(payload);
  },
};
