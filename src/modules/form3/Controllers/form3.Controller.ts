import { Request, Response } from "express";
import { form3Usecases } from "../../form3/Usecases/form3.Usecase";

/* ============================================================
   GET API — Fetch Form2 list for Form3
   URL: /api/form3/form2-list
   ============================================================ */
export const getForm2ListForForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.id;
    const fm2id = req.query?.form2_id;

    if (!uid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID missing",
      });
    }

    const data = await form3Usecases.getForm2ListForForm3(uid, fm2id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form2 list fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};

/* ============================================================
   GET API — Fetch Form3 list by logged-in user
   URL: /api/form3/list
   ============================================================ */
export const getForm3ListByUser = async (req: any, res: Response) => {
  try {
    const uid = req.user?.id;

    if (!uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await form3Usecases.getForm3ListByUser(uid);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form3 list fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};

/* ============================================================
   GET API — Fetch Editable (Latest) Form3
   URL: /api/form3/editable
   ============================================================ */
export const getEditableForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.id;

    if (!uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await form3Usecases.getEditableForm3(uid);

    if (!data) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No editable Form3 found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Editable Form3 fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};

/* ============================================================
   POST API — Submit Form3
   URL: /api/form3/submit
   ============================================================ */
export const submitForm3 = async (req: Request, res: Response) => {
  try {
    const result = await form3Usecases.submitForm3Usecase(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/* ============================================================
   PUT API — Edit & Submit Form3 Again
   URL: /api/form3/edit
   ============================================================ */
export const updateForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.id;

    if (!uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const result = await form3Usecases.updateForm3Usecase({
      uid,
      ...req.body,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};
