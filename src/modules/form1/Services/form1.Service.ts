import {
  getCheckpointZonesUsecase,
  submitForm1Usecase,
  getMasterZonesUsecase,
  getRuralDetailsUsecase,
  getForm1ListUsecase,
  getEditableForm1Usecase,
  editEditableForm1Usecase,
} from "../../form1/Usecases/form1.Usecase";


/*Get checkpoint zones*/
export const getCheckpointZonesService = async (
  userId: number,
  selectedIds: number[]
) => {
  return await getCheckpointZonesUsecase(userId, selectedIds);
};

/*Submit Form1*/
export const submitForm1Service = async (payload: any) => {
  return await submitForm1Usecase(payload);
};

/*Get master zones for logged-in user*/
export const getMasterZonesService = async (userId: number) => {
  return await getMasterZonesUsecase(userId);
};

/*Get rural reservation details*/
export const getRuralDetailsService = async (ids: number[]) => {
  return await getRuralDetailsUsecase(ids);
};

/*Get Form1 list*/
export const getForm1ListService = async (
  userId: number,
  districtName: string,
  zoneName: string
) => {
  return await getForm1ListUsecase(userId, districtName, zoneName);
};

/*Get editable Form1*/
export const getEditableForm1Service = async (userId: number) => {
  return await getEditableForm1Usecase(userId);
};

/*Edit Form1*/
export const editForm1Service = async (payload: any) => {
  return await editEditableForm1Usecase(payload);
};
