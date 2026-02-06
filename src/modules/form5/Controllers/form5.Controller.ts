import { Request, Response } from "express";
import { Form5Usecase } from "../../form5/Usecases/form5.Usecase";
import {
  form5SubmitSchema,
  form5EditSchema,
} from "../../form5/Validations/form5.Schema";
import { sendResponse, sendError } from "../../../utils/response";

export const Form5Controller = {
  /**
   * 1️⃣ GET Eligible Societies for Form5
   */
  async getEligibleSocieties(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form5Usecase.getEligibleSocietiesByUser(uid);

      return sendResponse(
        res,
        200,
        "Form5 eligible data fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error fetching Form5 eligible data",
        err.message
      );
    }
  },

  /**
   * 2️⃣ POST Submit Form5 (First submission)
   */
  async submitForm5(req: Request, res: Response) {
    try {
      const { error, value } = form5SubmitSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map((e) => e.message)
        );
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const result = await Form5Usecase.submitMembers({
        uid,
        members: value.members,
      });

      return sendResponse(
        res,
        200,
        "Form5 submitted successfully",
        result
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error submitting Form5",
        err.message
      );
    }
  },

  /**
   * 3️⃣ GET Form5 List (Read-only Review)
   */
  async getForm5List(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form5Usecase.getForm5ListByUser(uid);

      return sendResponse(
        res,
        200,
        "Form5 list fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error fetching Form5 list",
        err.message
      );
    }
  },

  /**
   * 4️⃣ GET Editable Form5 (Review + Prefill for Edit)
   */
  async getEditableForm5(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form5Usecase.getEditableForm5(uid);

      return sendResponse(
        res,
        200,
        "Editable Form5 fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error fetching editable Form5",
        err.message
      );
    }
  },

  /**
   * 5️⃣ PUT Edit Form5 (Edit & Submit Again)
   */
  async editForm5(req: Request, res: Response) {
    try {
      const { error, value } = form5EditSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return sendError(
          res,
          400,
          "Validation failed",
          error.details.map((e) => e.message)
        );
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const result = await Form5Usecase.editForm5({
        uid,
        members: value.members,
      });

      return sendResponse(
        res,
        200,
        "Form5 updated successfully",
        result
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error updating Form5",
        err.message
      );
    }
  },
};
