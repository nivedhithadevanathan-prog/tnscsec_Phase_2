import { Request, Response } from "express";
import { Form4Usecase } from "../../form4/Usecases/form4.Usecase";
import { sendResponse, sendError } from "../../../utils/response";
import {
  checkboxSchema,
  submitSchema,
  editForm4Schema,
} from "../../form4/Validations/form4.Schema";

export const Form4Controller = {

  /*Load Form4 base data*/
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

  /*Checkbox preview*/
  async checkboxUpdate(req: Request, res: Response) {
    try {
      const { error, value } = checkboxSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map(e => e.message)
        );
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form4Usecase.checkboxUpdate(
        uid,
        value.selected_ids
      );

      return sendResponse(res, 200, "Checkbox preview fetched", data);

    } catch (err: any) {
      return sendError(res, 500, "Error processing checkbox preview", err.message);
    }
  },

  /*Submit Form4*/
  async submitForm4(req: Request, res: Response) {
    try {
      const { error, value } = submitSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map(e => e.message)
        );
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = { ...value, uid };

      const result = await Form4Usecase.submitForm4(payload);

      return sendResponse(
        res,
        200,
        "Form4 submitted successfully",
        result
      );

    } catch (err: any) {
      return sendError(res, 500, "Error submitting Form4", err.message);
    }
  },

  /*List all Form4 by logged-in user*/
  async getForm4List(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form4Usecase.getForm4ListByUser(uid);

      return sendResponse(
        res,
        200,
        "Form4 list fetched",
        data
      );

    } catch (err: any) {
      return sendError(res, 500, "Error fetching Form4 list", err.message);
    }
  },

  /*Get Form4 details by ID (read-only)*/
  async getForm4Details(req: Request, res: Response) {
    try {
      const form4_id = Number(req.params.form4_id);
      if (!form4_id) {
        return sendError(res, 400, "form4_id is required");
      }

      const data = await Form4Usecase.getForm4Details(form4_id);

      if (!data) {
        return sendError(res, 404, "Form4 not found");
      }

      return sendResponse(
        res,
        200,
        "Form4 details fetched",
        data
      );

    } catch (err: any) {
      return sendError(res, 500, "Error fetching Form4 details", err.message);
    }
  },

  /*Editable Form4*/
  async getEditableForm4(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form4Usecase.getEditableForm4(uid);

      if (!data) {
        return sendError(res, 404, "No submitted Form4 found");
      }

      return sendResponse(
        res,
        200,
        "Editable Form4 fetched",
        data
      );

    } catch (err: any) {
      return sendError(res, 500, "Error fetching editable Form4", err.message);
    }
  },

  /* Edit Form4*/
  async editForm4(req: Request, res: Response) {
    try {
      const { error, value } = editForm4Schema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map(e => e.message)
        );
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = { ...value, uid };

      const result = await Form4Usecase.editForm4(payload);

      return sendResponse(
        res,
        200,
        "Form4 updated successfully",
        result
      );

    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        "Error updating Form4",
        err.message
      );
    }
  },

};
