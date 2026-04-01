import { Request, Response } from "express";
import { Form6Usecase } from "../../form6/Usecases/form6.Usecase";
import { sendResponse, sendError } from "../../../utils/response";


export const form6Controller = {

  /*INIT FORM-6*/
  async initForm6(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form6Usecase.initForm6(uid);

      return sendResponse(
        res,
        200,
        "Form6 initialized successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error initializing Form6", error.message);
    }
  },

  /*PREVIEW FORM-6*/
  async loadForm6Preview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form6Usecase.loadForm6Preview(uid);

      return sendResponse(
        res,
        200,
        "Form6 preview data fetched successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error loading Form6 preview", error.message);
    }
  },

  /*EDITABLE FORM-6*/
  async getEditableForm6(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form6Usecase.getEditableForm6(uid);

      return sendResponse(
        res,
        200,
        "Editable Form6 fetched successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error fetching editable Form6", error.message);
    }
  },

  /*LIST FORM-6*/
async listForm6(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await Form6Usecase.listForm6({
      uid: Number(user.uid),
      role: Number(user.role),
      zone_id: user.zone_id,
    });

    return sendResponse(
      res,
      200,
      "Form6 list fetched successfully",
      data
    );

  } catch (error: any) {
    return sendError(
      res,
      500,
      "Error fetching Form6 list",
      error.message
    );
  }
},

  /*CANDIDATE WITHDRAW / REINSTATE*/
  async withdrawCandidate(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { form4_filed_soc_id, form5_member_id } = req.body;

      if (!form4_filed_soc_id || !form5_member_id) {
        return sendError(
          res,
          400,
          "form4_filed_soc_id and form5_member_id are required"
        );
      }

      const data = await Form6Usecase.withdrawCandidate({
        uid,
        form4_filed_soc_id,
        form5_member_id,
      });

      return sendResponse(
        res,
        200,
        "Candidate withdrawal processed successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error processing candidate withdrawal", error.message);
    }
  },

  /*SOCIETY DECISION*/
  async societyDecision(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { form4_filed_soc_id, election_action } = req.body;

      if (!form4_filed_soc_id || !election_action) {
        return sendError(
          res,
          400,
          "form4_filed_soc_id and election_action are required"
        );
      }

      const data = await Form6Usecase.societyDecision({
        uid,
        form4_filed_soc_id,
        election_action,
      });

      return sendResponse(
        res,
        200,
        "Society decision updated successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error updating society decision", error.message);
    }
  },

  /*EDIT FORM-6*/
  async editForm6(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { societies } = req.body;

      if (!Array.isArray(societies) || societies.length === 0) {
        return sendError(res, 400, "societies array is required");
      }

      const data = await Form6Usecase.editForm6({
        uid,
        societies,
      });

      return sendResponse(
        res,
        200,
        "Form6 updated successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error editing Form6", error.message);
    }
  },

  /*SUBMIT FORM-6*/
  async submitForm6(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form6Usecase.submitForm6(uid);

      return sendResponse(
        res,
        200,
        "Form6 submitted successfully",
        data
      );
    } catch (error: any) {
      return sendError(res, 500, "Error submitting Form6", error.message);
    }
  },

};
