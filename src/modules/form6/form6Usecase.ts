import { Form6Service } from "./form6Service";

export const Form6Usecase = {
  getBasePreview(uid: number) {
    return Form6Service.getBasePreview(uid);
  },
   simulatePreview(payload: any, uid: number) {
    return Form6Service.simulatePreview(payload, uid);
  },
  stopElection(payload: any, uid: number) {
  return Form6Service.stopElection(payload, uid);
},

submitForm6(form6_id: number, uid: number) {
  return Form6Service.submitForm6(form6_id, uid);
},
initForm6(uid: number) {
    return Form6Service.initForm6(uid);
  },
   withdrawCandidate(payload: any, uid: number) {
    return Form6Service.withdrawCandidate(payload, uid);
  },
  listForm6(uid: number) {
    return Form6Service.listForm6(uid);
  },
};

