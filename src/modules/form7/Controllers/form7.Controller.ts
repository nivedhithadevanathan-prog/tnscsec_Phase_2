import { Request, Response } from "express";
import { sendResponse, sendError } from "../../../utils/response";
import { Form7Usecase } from "../../form7/Usecases/form7.Usecase";


export const Form7Controller = {
  /*GET Form7 Preview*/
  async preview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form7Usecase.preview(uid);

      return sendResponse(
        res,
        200,
        "Form7 preview fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error fetching Form7 preview",
        err.details || err
      );
    }
  },

  /*POST Submit Form7*/
  async submit(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = {
        uid,
        ...req.body,
      };

      const data = await Form7Usecase.submit(payload);

      return sendResponse(
        res,
        200,
        "Form7 submitted successfully",
        {
          form7_id: data.form7_id,
          district_id: data.district_id,
          societies_count: data.societies_count,
          status: "FORM7_SUBMITTED",
        }
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error submitting Form7",
        err.details || err
      );
    }
  },
/* GET Form7 List */
async list(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await Form7Usecase.list({
      uid: Number(user.uid),
      role: Number(user.role),
    });

    return sendResponse(
      res,
      200,
      "Form7 list fetched",
      data
    );

  } catch (err: any) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Error fetching Form7 list",
      err.details || err
    );
  }
},

  /*GET Editable Form7*/
  async editable(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form7Usecase.editable(uid);

      return sendResponse(
        res,
        200,
        "Editable Form7 fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error fetching editable Form7",
        err.details || err
      );
    }
  },

  /*PUT Edit Form7*/
  async edit(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const payload = {
        uid,
        ...req.body,
      };

      const data = await Form7Usecase.edit(payload);

      return sendResponse(
        res,
        200,
        "Form7 updated successfully",
        {
          form7_id: data.form7_id,
          societies_count: data.societies_count,
          status: "FORM7_UPDATED",
        }
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error updating Form7",
        err.details || err
      );
    }
  },
};
