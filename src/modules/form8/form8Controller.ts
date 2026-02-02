import { Request, Response } from "express";
import { Form8Usecase } from "./form8Usecase";
import { sendResponse, sendError } from "../../utils/response";
import { submitForm8Schema,checkboxForm8Schema } from "./form8Schema";

export const Form8Controller = {

  async getPreview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form8Usecase.getPreview(uid);
      return sendResponse(res, 200, "Form8 preview fetched", data);

    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },


  async checkboxPreview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { error } = checkboxForm8Schema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);

      const data = await Form8Usecase.checkboxPreview(req.body, uid);
      return sendResponse(res, 200, "Checkbox preview success", data);

    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  },

  async submitForm8(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { error } = submitForm8Schema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);

      const result = await Form8Usecase.submitForm8(req.body, uid);
      return sendResponse(res, 200, "Form8 submitted successfully", result);

    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  },


  async listForm8(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form8Usecase.listForm8(uid);
      return sendResponse(res, 200, "Form8 list fetched", data);

    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  }
};
