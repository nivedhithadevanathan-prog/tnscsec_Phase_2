import { Request, Response } from "express";
import { Form9Usecase } from "./form9Usecase";
import { sendResponse, sendError } from "../../utils/response";
import {
  rejectSchema,
  withdrawSchema,
  finalizeSchema,
  submitSchema,
  initForm9Schema
} from "./form9Schema";

export const Form9Controller = {

  async getPreview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form9Usecase.getPreview(uid);
      return sendResponse(res, 200, "Form9 preview fetched", data);

    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },

  
  async init(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { error } = initForm9Schema.validate(req.body);
      if (error) return sendError(res, 400, error.message);

      const data = await Form9Usecase.init(uid);

      return sendResponse(
        res,
        200,
        "Form9 initialized successfully",
        data
      );

    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  },

  async reject(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      const { error } = rejectSchema.validate(req.body);
      if (error) return sendError(res, 400, error.message);

      await Form9Usecase.reject(req.body, uid);
      return sendResponse(res, 200, "Candidates rejected");

    } catch (e: any) {
      return sendError(res, 400, e.message);
    }
  },

  async withdraw(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      const { error } = withdrawSchema.validate(req.body);
      if (error) return sendError(res, 400, error.message);

      await Form9Usecase.withdraw(req.body, uid);
      return sendResponse(res, 200, "Candidates withdrawn");

    } catch (e: any) {
      return sendError(res, 400, e.message);
    }
  },

  async finalize(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      const { error } = finalizeSchema.validate(req.body);
      if (error) return sendError(res, 400, error.message);

      await Form9Usecase.finalize(req.body, uid);
      return sendResponse(res, 200, "Society finalized");

    } catch (e: any) {
      return sendError(res, 400, e.message);
    }
  },

  async submit(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      const { error } = submitSchema.validate(req.body);
      if (error) return sendError(res, 400, error.message);

      await Form9Usecase.submit(req.body.form9_id, uid);
      return sendResponse(res, 200, "Form9 submitted");

    } catch (e: any) {
      return sendError(res, 400, e.message);
    }
  },


  async list(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form9Usecase.list(uid);
    return sendResponse(res, 200, "Form9 winners list fetched", data);

  } catch (e: any) {
    return sendError(res, 400, e.message);
  }
}

};
