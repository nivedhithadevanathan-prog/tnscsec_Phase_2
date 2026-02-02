import { Request, Response } from "express";
import { sendResponse, sendError } from "../../utils/response";
import {
  getForm1SelectedUsecase,
  checkboxForm2Usecase,
  submitForm2Usecase,
  getSubmittedForm2Usecase,
  listForm2Usecase,
  getEditableForm2Usecase,
  editForm2Usecase,
} from "./form2Usecase";


export const getForm1SelectedController = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await getForm1SelectedUsecase(uid);
    return sendResponse(res, 200, "Form1 societies fetched", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};


export const checkboxForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    const { selectedIds = [] } = req.body;

    if (!Array.isArray(selectedIds))
      return sendError(res, 400, "selectedIds must be an array");

    const data = await checkboxForm2Usecase(uid, selectedIds);
    return sendResponse(res, 200, "Checkbox preview generated", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};


export const submitForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const payload = {
      uid,
      selectedIds: req.body.selectedIds || [],
      remark: req.body.remark,
    };

    const data = await submitForm2Usecase(payload);
    return sendResponse(res, 200, "Form2 saved successfully", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};


export const getSubmittedForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await getSubmittedForm2Usecase(uid);
    if (!data) return sendError(res, 404, "Form2 not found");

    return sendResponse(res, 200, "Form2 submitted details fetched", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
};


export const listForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await listForm2Usecase(uid);
    return sendResponse(res, 200, "Form2 list fetched successfully", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
};


export const getEditableForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await getEditableForm2Usecase(uid);

    if (!data) {
      return sendError(res, 404, "No editable Form2 found");
    }

    return sendResponse(res, 200, "Editable Form2 fetched", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};

export const editForm2Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const { selectedIds = [], remark } = req.body;

    if (!Array.isArray(selectedIds)) {
      return sendError(res, 400, "selectedIds must be an array");
    }

    const data = await editForm2Usecase(uid, { selectedIds, remark });

    return sendResponse(res, 200, "Form2 updated successfully", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};
