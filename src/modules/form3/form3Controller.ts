import { Request, Response } from "express";
import { getForm3ListUsecase, submitForm3Usecase,listForm3Usecase,getSubmittedForm3Usecase } from "./form3Usecase";
import { getEditableForm3Usecase, editForm3Usecase } from "./form3Usecase";
import { sendResponse, sendError } from "../../utils/response";
import { form3Schema } from "./schema";


export const getForm3ListController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const data = await getForm3ListUsecase(user);

    if (data.error) {
      return sendError(res, 400, data.error);
    }

    return sendResponse(res, 200, "Form2 list fetched successfully", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
};


export const submitForm3Controller = async (req: Request, res: Response) => {
  try {
    const { error } = form3Schema.validate(req.body);

    if (error) {
      return sendError(res, 400, error.details[0].message);
    }

    const user = (req as any).user;

    const data = await submitForm3Usecase(req.body, user);

    return sendResponse(res, 200, "Form3 submitted successfully", data);
  } catch (err: any) {
    console.error("❌ Form3 Submit Error:", err);
    return sendError(res, 500, err.message || "Internal Server Error");
  }
};
;

export const listForm3Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await listForm3Usecase(uid);

    return sendResponse(res, 200, "Form3 list fetched successfully", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
};

export const getSubmittedForm3Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    const form3_id = Number(req.params.form3_id);

    if (!uid) return sendError(res, 401, "Unauthorized");
    if (!form3_id) return sendError(res, 400, "form3_id is required");

    const data = await getSubmittedForm3Usecase(form3_id, uid);

    if (!data) return sendError(res, 404, "Form3 not found");

    return sendResponse(res, 200, "Form3 submitted details fetched", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
};



export const getEditableForm3Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await getEditableForm3Usecase(uid);

    if (!data) {
      return sendError(res, 404, "No editable Form3 found");
    }

    return sendResponse(res, 200, "Editable Form3 fetched", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};


export const editForm3Controller = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const payload = req.body;

    const data = await editForm3Usecase(uid, payload);

    return sendResponse(res, 200, "Form3 updated successfully", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
};

