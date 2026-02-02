import { Form5Service } from "./form5Service";

export const Form5Usecase = {
  getEligibleForm5(uid: number) {
    return Form5Service.getEligibleForm5(uid);
  },

  submitForm5(payload: any, uid: number) {
    return Form5Service.submitForm5(payload, uid);
  },

  listForm5(uid: number) {
    return Form5Service.listForm5(uid);
  },
  getEditableForm5: (uid: number) =>
    Form5Service.getEditableForm5(uid),

  editForm5: (payload: any, uid: number) =>
    Form5Service.editForm5(payload, uid)
   
};
