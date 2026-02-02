import { Form1Service } from "./form1Service";

export const Form1Usecase = {
  submitForm1(payload: any) {
    return Form1Service.submitForm1(payload);
  },

  getMasterZones(userId: number) {
    return Form1Service.getMasterZones(userId);
  },

  getCheckpointZones(userId: number, selectedIds: number[]) {
    return Form1Service.getCheckpointZones(userId, selectedIds);
  },

  getRuralDetails(associationIds: number[]) {
    return Form1Service.getRuralDetails(associationIds);
  },

  getSubmittedForm1(form1Id: number, uid: number) {
    return Form1Service.getSubmittedForm1(form1Id, uid);
  },

  listForm1(uid: number) {
    return Form1Service.listForm1(uid);
  },

  editEditableForm1(uid: number, payload: any) {
    return Form1Service.editEditableForm1(uid, payload);
  },

  getEditableForm1(uid: number) {
    return Form1Service.getEditableForm1(uid);
  },
};

