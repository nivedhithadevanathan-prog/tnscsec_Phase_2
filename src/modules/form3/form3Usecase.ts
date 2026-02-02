import { getForm3ListService, submitForm3Service,listForm3Service,getSubmittedForm3Service} from "./form3Service";

import { getEditableForm3Service, editForm3Service } from "./form3Service";
export const getForm3ListUsecase = async (user: any) => {
  return await getForm3ListService(user);
};


export const submitForm3Usecase = async (payload: any, user: any) => {
  return await submitForm3Service(payload, user);
};

export const listForm3Usecase = async (uid: number) => {
  return await listForm3Service(uid);
};
export const getSubmittedForm3Usecase = async (form3_id: number, uid: number) => {
  return await getSubmittedForm3Service(form3_id, uid);
};

export const getEditableForm3Usecase = async (uid: number) => {
  return await getEditableForm3Service(uid);
};

export const editForm3Usecase = async (uid: number, payload: any) => {
  return await editForm3Service(uid, payload);
};

