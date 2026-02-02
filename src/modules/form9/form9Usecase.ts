import { Form9Service } from "./form9Service";

export const Form9Usecase = {

  getPreview(uid: number) {
    return Form9Service.getPreview(uid);
  },

  init(uid: number) {
    return Form9Service.init(uid);
  },

  reject(payload: any, uid: number) {
    return Form9Service.rejectCandidates(payload, uid);
  },

  withdraw(payload: any, uid: number) {
    return Form9Service.withdrawCandidates(payload, uid);
  },

  finalize(payload: any, uid: number) {
    return Form9Service.finalizeSociety(payload, uid);
  },

  submit(form9_id: number, uid: number) {
    return Form9Service.submitForm9(form9_id, uid);
  },
  list(uid: number) {
  return Form9Service.list(uid);
}

};
