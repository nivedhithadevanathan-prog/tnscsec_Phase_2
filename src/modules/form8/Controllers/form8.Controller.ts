import { Request, Response } from "express";
import { sendResponse, sendError } from "../../../utils/response";
import {
  Form8PreviewUsecase,
  Form8CheckboxUsecase,
  Form8FinalResultUsecase,
  Form8SubmitUsecase,
  Form8ListUsecase,
} from "../../form8/Usecases/form8.Usecase";

export const Form8Controller = {

  /**
   * =====================================================
   * GET: Preview Form8 (Vote Counting)
   * =====================================================
   */
  async previewForm8(req: Request, res: Response) {
    try {
      const request = req as any;
      const user = request.user;

      if (!user?.uid || !user?.district_id) {
        return sendError(res, 401, "Unauthorized");
      }

      const data = await Form8PreviewUsecase.preview({
        uid: user.uid,
        district_id: user.district_id,
      });

      return sendResponse(res, 200, "Form8 preview fetched", data);
    } catch (err: any) {
      return sendError(res, 500, "Failed to fetch Form8 preview", err.message);
    }
  },

  /**
   * =====================================================
   * GET: Checkbox Preview (Auto-selection)
   * =====================================================
   */
  async checkboxPreview(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.uid || !user?.district_id) {
        return sendError(res, 401, "Unauthorized");
      }

      const data =
        await Form8CheckboxUsecase.checkboxPreview(
          user.district_id
        );

      return sendResponse(
        res,
        200,
        "Checkbox preview success",
        data
      );
    } catch (err: any) {
      return sendError(res, 500, "Failed to fetch checkbox preview", err.message);
    }
  },

  /**
   * =====================================================
   * POST: Save Final Result (Winners)
   * Supports:
   * - SC_ST / WOMEN / GENERAL
   * - SC_ST_DLG / WOMEN_DLG / GENERAL_DLG
   * =====================================================
   */
  async saveFinalResult(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.uid || !user?.district_id) {
        return sendError(res, 401, "Unauthorized");
      }

      /**
       * Expected body:
       * {
       *   form7_society_id: number,
       *   winners: {
       *     SC_ST: number[],
       *     WOMEN: number[],
       *     GENERAL: number[],
       *     SC_ST_DLG?: number[],
       *     WOMEN_DLG?: number[],
       *     GENERAL_DLG?: number[]
       *   }
       * }
       */
      const result =
        await Form8FinalResultUsecase.saveFinalResult({
          uid: user.uid,
          district_id: user.district_id,
          payload: req.body,
        });

      return sendResponse(
        res,
        200,
        "Final result saved successfully",
        result
      );
    } catch (err: any) {
      return sendError(res, 400, "Failed to save final result", err.message);
    }
  },

  /**
   * =====================================================
   * POST: Submit Form8 (Polling Details)
   * =====================================================
   */
  async submitForm8(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.uid || !user?.district_id) {
        return sendError(res, 401, "Unauthorized");
      }

      /**
       * Expected body:
       * {
       *   societies: [
       *     {
       *       form7_society_id: number,
       *       polling_details: {
       *         ballot_votes_at_counting: number,
       *         valid_votes: number,
       *         invalid_votes: number,
       *         remarks?: string
       *       }
       *     }
       *   ]
       * }
       */
      const { societies } = req.body;

      if (!Array.isArray(societies) || societies.length === 0) {
        return sendError(res, 400, "Societies data is required");
      }

      const result =
        await Form8SubmitUsecase.submit({
          uid: user.uid,
          district_id: user.district_id,
          societies,
        });

      return sendResponse(
        res,
        200,
        "Form8 submitted successfully",
        result
      );
    } catch (err: any) {
      return sendError(res, 400, "Failed to submit Form8", err.message);
    }
  },

  /**
   * =====================================================
   * GET: Form8 List (Submitted Data)
   * =====================================================
   */
  async listForm8(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user?.uid || !user?.district_id) {
        return sendError(res, 401, "Unauthorized");
      }

      const data =
        await Form8ListUsecase.list({
          uid: user.uid,
          district_id: user.district_id,
        });

      return sendResponse(
        res,
        200,
        "Form8 list fetched",
        data
      );
    } catch (err: any) {
      return sendError(res, 500, "Failed to fetch Form8 list", err.message);
    }
  },

};
