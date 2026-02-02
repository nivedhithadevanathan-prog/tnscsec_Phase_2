import { Request, Response } from "express";
import { Form5Usecase } from "./form5Usecase";
import { sendResponse, sendError } from "../../utils/response";

export const Form5Controller = {

  async getEligibleForm5(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form5Usecase.getEligibleForm5(uid);
      return sendResponse(res, 200, "Form5 eligible data fetched", data);
    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },

  async submitForm5(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const result = await Form5Usecase.submitForm5(req.body, uid);
      return sendResponse(res, 200, "Form5 members saved", result);
    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  },

  async listForm5(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form5Usecase.listForm5(uid);
      return sendResponse(res, 200, "Form5 list fetched", data);
    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },
  async getEditableForm5(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form5Usecase.getEditableForm5(uid);
    return sendResponse(res, 200, "Editable Form5 fetched", data);

  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
},

async editForm5(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const result = await Form5Usecase.editForm5(req.body, uid);
    return sendResponse(res, 200, "Form5 updated successfully", result);

  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
},

  
};
