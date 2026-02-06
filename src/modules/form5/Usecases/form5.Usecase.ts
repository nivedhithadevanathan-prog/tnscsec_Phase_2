import { Form5Service } from "../../form5/Services/form5.Service";

export const Form5Usecase = {
  /**
   * 1️⃣ GET Eligible societies for Form5
   */
  getEligibleSocietiesByUser(uid: number) {
    return Form5Service.getEligibleSocietiesByUser(uid);
  },

  /**
   * 2️⃣ POST Submit Form5 (First submit)
   */
  submitMembers(payload: {
    uid: number;
    members: any[];
  }) {
    return Form5Service.submitMembers(payload);
  },

  /**
   * 3️⃣ GET Form5 list (Read-only review)
   */
  getForm5ListByUser(uid: number) {
    return Form5Service.getForm5ListByUser(uid);
  },

  /**
   * 4️⃣ GET Editable Form5 (Prefill for edit)
   */
  getEditableForm5(uid: number) {
    return Form5Service.getEditableForm5(uid);
  },

  /**
   * 5️⃣ PUT Edit Form5 (Edit & submit again)
   */
  editForm5(payload: {
    uid: number;
    members: any[];
  }) {
    return Form5Service.editForm5(payload);
  },
};
