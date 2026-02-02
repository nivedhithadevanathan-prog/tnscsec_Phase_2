import { Request, Response } from "express";
import { Form4Usecase } from "./form4Usecase";
import { sendResponse, sendError } from "../../utils/response";
import { checkboxSchema, submitSchema } from "./schema";

export const Form4Controller = {
  async loadForm4(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form4Usecase.loadForm4(uid);
      return sendResponse(res, 200, "Form4 load list fetched", data);
    } catch (err: any) {
      return sendError(res, 500, "Error loading Form4", err.message);
    }
  },

  async checkboxUpdate(req: Request, res: Response) {
    try {
      const { error, value } = checkboxSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error)
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map((e: any) => e.message)
        );

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const result = await Form4Usecase.checkboxUpdate(uid, value.selected_ids);
      return sendResponse(res, 200, "Checkbox preview fetched", result);
    } catch (err: any) {
      return sendError(res, 500, "Error processing checkbox update", err.message);
    }
  },

  async submitForm4(req: Request, res: Response) {
    try {
      const { error, value } = submitSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error)
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map((e: any) => e.message)
        );

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = { ...value, uid };

      const result = await Form4Usecase.submitForm4(payload);
      return sendResponse(res, 200, "Form4 submitted successfully", result);
    } catch (err: any) {
      return sendError(res, 500, "Error submitting Form4", err.message);
    }
  },

  async getForm4Details(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const form4Id = Number(req.params.form4_id || req.params.id);
      if (!form4Id) return sendError(res, 400, "form4_id is required");

      const data = await Form4Usecase.getForm4Details(form4Id);
      if (!data) return sendError(res, 404, "Form4 not found");

      return sendResponse(res, 200, "Form4 details fetched", data);
    } catch (err: any) {
      return sendError(res, 500, "Error fetching Form4 details", err.message);
    }
  },

  async listForm4(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form4Usecase.listForm4(uid);
    return sendResponse(res, 200, "Form4 list fetched successfully", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
},  



// STEP 1 — Get editable Form4
  async getEditableForm4(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form4Usecase.getEditableForm4(uid);
      if (!data) return sendError(res, 404, "No editable Form4 found");

      return sendResponse(res, 200, "Editable Form4 fetched", data);
    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },
   async editForm4(req: Request, res: Response) {
    try {
      const { error, value } = submitSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error)
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map((e: any) => e.message)
        );

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = { ...value, uid };

      const result = await Form4Usecase.editForm4(payload);
      return sendResponse(res, 200, "Form4 edited successfully", result);
    } catch (err: any) {
      return sendError(res, 500, err.message);
    }
  },
};

