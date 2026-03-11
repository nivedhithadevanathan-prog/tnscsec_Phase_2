import { Request, Response } from "express";
import { Form5BUsecase } from "../../form5b/Usecases/form5b.Usecase";
import { sendResponse, sendError } from "../../../utils/response";
import { form5bEditSchema, stopSocietySchema } from "../Validations/form5b.schema";
import { stopCandidateSchema } from "../Validations/form5b.schema";


export const Form5BController = {

  /*GET Preview for Form5B*/
  async getPreview(req: Request, res: Response) {
    try {
      const uid = Number((req as any).user?.uid);

      if (!uid) {
        return sendError(res, 401, "Unauthorized");
      }

      const data = await Form5BUsecase.getPreview(uid);

      return sendResponse(
        res,
        200,
        "Form5B preview fetched",
        data
      );

    } catch (err: any) {
      return sendError(
        res,
        500,
        "Error fetching Form5B preview",
        err.message
      );
    }
  },

 /*POST Stop Societies*/
async stopSociety(req: Request, res: Response) {
  try {

    const { error, value } = stopSocietySchema.validate(req.body, {
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

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await Form5BUsecase.stopSocieties({
      uid,
      societies: value.societies,
    });

    return sendResponse(
      res,
      200,
      "Societies stopped successfully",
      result
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      "Error stopping societies",
      err.message
    );
  }
},

/*POST Stop Candidates*/
async stopCandidates(req: Request, res: Response) {
  try {

    const { error, value } = stopCandidateSchema.validate(req.body, {
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

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await Form5BUsecase.stopCandidates({
      uid,
      candidates: value.candidates,
    });

    return sendResponse(
      res,
      200,
      "Candidates stopped successfully",
      result
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      "Error stopping candidates",
      err.message
    );
  }
},


/*POST Submit Form5B*/
async submitForm5B(req: Request, res: Response) {
  try {

    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await Form5BUsecase.submitForm5B(uid);

    return sendResponse(
      res,
      200,
      "Form5B submitted successfully",
      result
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      "Error submitting Form5B",
      err.message
    );
  }
},

/*GET Form5B List*/
async getForm5BList(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await Form5BUsecase.getForm5BListByUser({
      uid: Number(user.uid),
      role: Number(user.role),
    });

    return sendResponse(
      res,
      200,
      "Form5B list fetched",
      data
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      err.message || "Error fetching Form5B list"
    );
  }
},

/*GET Editable Form5B*/
async getEditableForm5B(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    const data = await Form5BUsecase.getEditableForm5BByUser({
      uid: Number(user.uid),
      role: Number(user.role),
    });

    return sendResponse(
      res,
      200,
      "Editable Form5B fetched",
      data
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      err.message || "Error fetching editable Form5B"
    );
  }
},

/*PUT Edit Form5B*/
async editForm5B(req: Request, res: Response) {
  try {

    const { error, value } = form5bEditSchema.validate(req.body, {
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

    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await Form5BUsecase.editForm5B({
      uid: Number(user.uid),
      role: Number(user.role),
      societies: value.societies,
      candidates: value.candidates,
    });

    return sendResponse(
      res,
      200,
      "Form5B updated successfully",
      result
    );

  } catch (err: any) {
    return sendError(
      res,
      500,
      "Error updating Form5B",
      err.message
    );
  }
},

};