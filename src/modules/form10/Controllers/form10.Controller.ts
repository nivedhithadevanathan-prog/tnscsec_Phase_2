import { Request, Response } from "express";
import { sendResponse, sendError } from "../../../utils/response";
import { Form10Usecase } from "../../form10/Usecases/form10.Usecase";
import { Form10Service } from "../../form10/Services/form10.Service";
export const Form10Controller = {

  /*POST FORM10 INIT*/
  async init(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);

      if (!uid) {
        return sendError(res, 401, "Unauthorized");
      }

      const data = await Form10Usecase.init(uid);

      return sendResponse(
        res,
        201,
        "Form10 initialized",
        data
      );

    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error initializing Form10"
      );
    }
  },


  /*GET FORM10 PREVIEW*/
  async preview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);

      if (!uid) {
        return sendError(res, 401, "Unauthorized");
      }

      const data = await Form10Usecase.preview(uid);

      return sendResponse(
        res,
        200,
        "Form10 preview fetched",
        data
      );

    } catch (err: any) {
      return sendError(
        res,
        err.statusCode || 500,
        err.message || "Error fetching Form10 preview"
      );
    }
  },

  /*POST FORM10 REJECT CANDIDATES*/
  async reject(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);

      if (!uid) {
        return sendError(res, 401, "Unauthorized");
      }

      const {
        form10_id,
        form10_society_id,
        candidates,
      } = req.body;

      if (!form10_id || !form10_society_id) {
        return sendError(
          res,
          400,
          "form10_id and form10_society_id are required"
        );
      }

      if (!Array.isArray(candidates) || !candidates.length) {
        return sendError(
          res,
          400,
          "Candidates array is required"
        );
      }

      await Form10Usecase.reject({
        uid,
        form10_id,
        form10_society_id,
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


  /*POST FORM10 WITHDRAW CANDIDATES*/
async withdraw(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const {
      form10_id,
      form10_society_id,
      candidates,
    } = req.body;

    if (!form10_id || !form10_society_id) {
      return sendError(
        res,
        400,
        "form10_id and form10_society_id are required"
      );
    }

    if (!Array.isArray(candidates) || !candidates.length) {
      return sendError(
        res,
        400,
        "Candidates array is required"
      );
    }

    await Form10Usecase.withdraw({
      uid,
      form10_id,
      form10_society_id,
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

/*POST FORM10 FINAL (PER SOCIETY)*/
async final(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const {
      form10_id,
      form10_society_id,
    } = req.body;

    if (!form10_id || !form10_society_id) {
      return sendError(
        res,
        400,
        "form10_id and form10_society_id are required"
      );
    }

    const data = await Form10Usecase.final({
      uid,
      form10_id,
      form10_society_id,
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

/*POST FORM10 SUBMIT*/
async submit(req: Request, res: Response) {
  try {
    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const { form10_id } = req.body;

    if (!form10_id) {
      return sendError(
        res,
        400,
        "form10_id is required"
      );
    }

    const data = await Form10Usecase.submit({
      uid,
      form10_id,
    });

    return sendResponse(
      res,
      200,
      "Form10 submitted successfully",
      data   
    );

  } catch (err: any) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Error submitting Form10"
    );
  }
},

/*GET FORM10 LIST*/
async list(req: Request, res: Response) {
  try {

    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

const data = await Form10Usecase.list({
  uid: Number(user.uid),
  role: Number(user.role),
  department_id: user.department_id,
  district_id: user.district_id,
  zone_id: user.zone_id,
});

    return sendResponse(
      res,
      200,
      "Form10 Vice-President list fetched",
      data
    );

  } catch (err: any) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Error fetching Form10 list"
    );
  }
},

/* GET FORM10 PDF */
async getForm10Pdf(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    await Form10Service.getForm10Pdf({
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
      err.message || "Error generating Form10 PDF",
      err.details || err
    );
  }
},

};
