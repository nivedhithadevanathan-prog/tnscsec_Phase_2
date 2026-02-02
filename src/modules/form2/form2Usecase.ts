import {
  getForm1SelectedService,
  checkboxForm2Service,
  submitForm2Service,
  getSubmittedForm2Service,
  listForm2Service,
  getEditableForm2Service,
  editForm2Service,
} from "./form2Service";

export const getForm1SelectedUsecase = (uid: number) =>
  getForm1SelectedService(uid);

export const checkboxForm2Usecase = (uid: number, selectedIds: number[]) =>
  checkboxForm2Service(uid, selectedIds);

export const submitForm2Usecase = (payload: any) =>
  submitForm2Service(payload);

export const getSubmittedForm2Usecase = (uid: number) =>
  getSubmittedForm2Service(uid);

export const listForm2Usecase = (uid: number) =>
  listForm2Service(uid);
export const getEditableForm2Usecase = (uid: number) =>
  getEditableForm2Service(uid);

export const editForm2Usecase = (uid: number, payload: any) =>
  editForm2Service(uid, payload);
