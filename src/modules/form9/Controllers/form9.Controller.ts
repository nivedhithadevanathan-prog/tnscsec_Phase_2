import { Request, Response } from "express";
import { sendResponse, sendError } from "../../../utils/response";
import { Form9Usecase } from "../../form9/Usecases/form9.Usecase";
import { Form9Service } from "../../form9/Services/form9.Service";
export const Form9Controller = {

  /*POST FORM9 INIT*/
  async init(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user.uid);

if (!uid) {
  return sendError(res, 401, "Unauthorized");
}


      const data = await Form9Usecase.init(uid);

      return sendResponse(
        res,
        201,
        "Form9 initialized",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error initializing Form9"
      );
    }
  },

  /*GET FORM9 PREVIEW*/
  async preview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const data = await Form9Usecase.preview(uid);

      return sendResponse(
        res,
        200,
        "Form9 preview fetched",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error fetching Form9 preview"
      );
    }
  },

  /*POST FORM9 REJECT CANDIDATES*/
  async reject(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const {
        form9_id,
        form9_society_id,
        candidates,
      } = req.body;

      if (!form9_id || !form9_society_id) {
        return sendError(res, 400, "form9_id and form9_society_id are required");
      }

      if (!Array.isArray(candidates) || !candidates.length) {
        return sendError(res, 400, "Candidates array is required");
      }

      await Form9Usecase.reject({
        uid,
        form9_id,
        form9_society_id,
        candidates,
      });

      return sendResponse(
        res,
        200,
        "Candidates rejected",
        null
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error rejecting candidates"
      );
    }
  },

  /*POST FORM9 WITHDRAW CANDIDATES*/
  async withdraw(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const {
        form9_id,
        form9_society_id,
        candidates,
      } = req.body;

      if (!form9_id || !form9_society_id) {
        return sendError(res, 400, "form9_id and form9_society_id are required");
      }

      if (!Array.isArray(candidates) || !candidates.length) {
        return sendError(res, 400, "Candidates array is required");
      }

      await Form9Usecase.withdraw({
        uid,
        form9_id,
        form9_society_id,
        candidates,
      });

      return sendResponse(
        res,
        200,
        "Candidates withdrawn",
        null
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error withdrawing candidates"
      );
    }
  },

  /*POST FORM9 FINAL (PER SOCIETY)*/
  async final(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const {
        form9_id,
        form9_society_id,
      } = req.body;

      if (!form9_id || !form9_society_id) {
        return sendError(res, 400, "form9_id and form9_society_id are required");
      }

      const data = await Form9Usecase.final({
        uid,
        form9_id,
        form9_society_id,
      });

      return sendResponse(
        res,
        200,
        "Society finalized successfully",
        data
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error finalizing society"
      );
    }
  },

/*GET FORM9 LIST (WINNERS)*/
async list(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

  const data = await Form9Usecase.list({
  uid: Number(user.uid),
  role: Number(user.role),
  department_id: user.department_id,
  district_id: user.district_id,
  zone_id: user.zone_id,
});

    return sendResponse(
      res,
      200,
      "Form9 winners list fetched",
      data
    );

  } catch (err: any) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Error fetching Form9 list"
    );
  }
},
  /*POST FORM9 SUBMIT*/
  async submit(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);
      if (!uid) return sendError(res, 401, "Unauthorized");

      const { form9_id } = req.body;

      if (!form9_id) {
        return sendError(res, 400, "form9_id is required");
      }

      const data = await Form9Usecase.submit({
        uid,
        form9_id,
      });

      return sendResponse(
        res,
        200,
        "Form9 submitted successfully",
        data 
      );
    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error submitting Form9"
      );
    }
  },

/* GET FORM9 PDF */
async getForm9Pdf(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    await Form9Service.getForm9Pdf({
      uid: Number(user.uid),
      role: Number(user.role),
      department_id: user.department_id,
      district_id: user.district_id,
      zone_id: user.zone_id,
      res,
    });

  } catch (err: any) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Error generating Form9 PDF",
      err.details || err
    );
  }
},

};
