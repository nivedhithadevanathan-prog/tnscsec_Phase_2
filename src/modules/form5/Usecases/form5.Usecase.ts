import { Form5Service } from "../../form5/Services/form5.Service";

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
getForm5ListByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form5Service.getForm5ListByUser({
    uid,
    role,
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
};
