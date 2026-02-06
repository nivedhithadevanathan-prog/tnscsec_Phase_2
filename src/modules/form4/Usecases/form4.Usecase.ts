import { Form4Service } from "../../form4/Services/form4.Service";

export const Form4Usecase = {

  /**
   * 1️⃣ Load Form4 base data
   */
  loadForm4(uid: number) {
    return Form4Service.loadForm4(uid);
  },

  /**
   * 2️⃣ Checkbox preview
   */
  checkboxUpdate(uid: number, selectedIds: number[]) {
    return Form4Service.getCheckboxPreview(uid, selectedIds);
  },

  /**
   * 3️⃣ Submit Form4 (CREATE)
   */
  submitForm4(payload: any) {
    return Form4Service.submitForm4(payload);
  },

  /**
   * 4️⃣ List all Form4 of logged-in user
   */
  getForm4ListByUser(uid: number) {
    return Form4Service.getForm4ListByUser(uid);
  },

  /**
   * 5️⃣ Get Form4 details by ID (read-only)
   */
  getForm4Details(form4_id: number) {
    return Form4Service.getForm4Details(form4_id);
  },

  /**
   * 6️⃣ Editable Form4 (Review + Prefill)
   */
  getEditableForm4(uid: number) {
    return Form4Service.getEditableForm4(uid);
  },

  /**
   * 7️⃣ Edit Form4 (UPDATE before Form5)
   */
  editForm4(payload: any) {
    return Form4Service.editForm4(payload);
  },
};
