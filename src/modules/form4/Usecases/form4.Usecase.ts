import { Form4Service } from "../../form4/Services/form4.Service";


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
getForm4ListByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form4Service.getForm4ListByUser({
    uid,
    role,
  });
},


  /*Get Form4 details by ID*/
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
};
