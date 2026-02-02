import { Request, Response } from "express";
import { Form1Usecase } from "./form1Usecase";
import { sendResponse, sendError } from "../../utils/response";
import { form1Schema } from "./schema";

export const Form1Controller = {
  async submitForm1(req: Request, res: Response) {
    try {
      const { error, value } = form1Schema.validate(req.body, { abortEarly: false });
      if (error) {
        return sendError(res, 400, "Validation failed", error.details.map(e => e.message));
      }

      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = { uid, ...value };
      const result = await Form1Usecase.submitForm1(payload);

      return sendResponse(res, 200, "Form1 submitted successfully", result);
    } catch (err: any) {
      return sendError(res, 500, "Error submitting Form1", err.message);
    }
  },

  async getMasterZones(req: Request, res: Response) {
    try {
      const userId = Number((req as any).user?.uid);
      const data = await Form1Usecase.getMasterZones(userId);
      return sendResponse(res, 200, "Master zones fetched successfully", data);
    } catch (err: any) {
      return sendError(res, 500, "Server error", err.message);
    }
  },

  async getCheckpointZones(req: Request, res: Response) {
    try {
      const userId = Number((req as any).user?.uid);
      const { selectedIds = [] } = req.body;

      const data = await Form1Usecase.getCheckpointZones(userId, selectedIds);
      return sendResponse(res, 200, "Checkpoint zones fetched successfully", data);
    } catch (err: any) {
      return sendError(res, 500, "Server error", err.message);
    }
  },

  async getRuralDetails(req: Request, res: Response) {
    try {
      const { associationIds } = req.body;
      if (!Array.isArray(associationIds)) {
        return sendError(res, 400, "associationIds must be an array");
      }

      const data = await Form1Usecase.getRuralDetails(associationIds);
      return sendResponse(res, 200, "Rural details fetched successfully", data);
    } catch (err: any) {
      return sendError(res, 500, "Server error", err.message);
    }
  },
  async getSubmittedForm1(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const form1Id = Number(req.params.id);
    if (!form1Id) return sendError(res, 400, "Form1 ID is required");

    const data = await Form1Usecase.getSubmittedForm1(form1Id, uid);

    if (!data) {
      return sendError(res, 404, "Form1 not found");
    }

    return sendResponse(res, 200, "Form1 submitted details fetched", data);
  } catch (err: any) {
    return sendError(res, 500, "Error fetching Form1 details", err.message);
  }
},
async listForm1(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form1Usecase.listForm1(uid);

    return sendResponse(res, 200, "Form1 list fetched successfully", data);
  } catch (err: any) {
    return sendError(res, 500, "Error fetching Form1 list", err.message);
  }
},

async editForm1(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const { error, value } = form1Schema.validate(req.body, {
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

    const data = await Form1Usecase.editEditableForm1(uid, value);

    return sendResponse(res, 200, "Form1 updated successfully", data);
  } catch (err: any) {
    return sendError(res, 400, err.message);
  }
},

async getEditableForm1(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);
    if (!uid) return sendError(res, 401, "Unauthorized");

    const data = await Form1Usecase.getEditableForm1(uid);

    if (!data) {
      return sendError(res, 404, "No editable Form1 found");
    }

    return sendResponse(res, 200, "Editable Form1 fetched", data);
  } catch (err: any) {
    return sendError(res, 500, err.message);
  }
}
};


