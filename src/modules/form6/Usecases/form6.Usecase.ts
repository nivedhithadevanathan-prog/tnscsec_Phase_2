import { Form6Service } from "../../form6/Services/form6.Service";


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
listForm6(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form6Service.listForm6({
    uid,
    role,
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
};
