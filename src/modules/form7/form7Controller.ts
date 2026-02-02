import { Request, Response } from "express";
import { sendResponse, sendError } from "../../utils/response";
import { Form7Usecase } from "./form7Usecase";
import { getForm7PreviewSchema, submitForm7Schema } from "./schema";

export const Form7Controller = {

  async getPreview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { error } = getForm7PreviewSchema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);

      const data = await Form7Usecase.getPreview(uid);

      return sendResponse(
        res,
        200,
        "Form7 preview fetched",
        data
      );
    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },

async submitForm7(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { error } = submitForm7Schema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);

      const result = await Form7Usecase.submitForm7(req.body, uid);

      return sendResponse(
        res,
        200,
        "Form7 submitted successfully",
        result
      );

    } catch (err: any) {
      return sendError(res, 400, err.message);
    }
  },

  async listForm7(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form7Usecase.listForm7(uid);
    return sendResponse(res, 200, "Form7 list fetched", data);

  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
}




};


