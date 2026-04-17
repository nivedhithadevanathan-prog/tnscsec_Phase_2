
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
import { form2Usecases } from "../usecases/form2.usecase";
import { AuthRequest } from "../../../middleware/auth.middleware";



/*GET Form1 Selected Societies(Used for Form2)*/
export const getForm2SelectedSocieties = async (req: Request, res: Response) => {
  try {
    const form1_id = Number(req.query.form1_id ?? req.body.form1_id);

    if (!form1_id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "form1_id is required",
      });
    }

    const data = await form2Usecases.fetchForm1SelectedSocieties(form1_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Form1 not found or no selected societies",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form1 societies fetched",
      data,
    });
  } catch (error) {
    console.error("Form2 GET error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

/*POST Checkbox Selection*/
export const checkboxForm2 = async (req: AuthRequest, res: Response) => {
  try {
    const { form1_id, selected_soc_ids } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!form1_id || !Array.isArray(selected_soc_ids)) {
      return res.status(400).json({
        success: false,
        message: "form1_id and selected_soc_ids are required",
      });
    }

    const result = await form2Usecases.checkboxSelectionUsecase({
      uid: Number(uid),
      form1_id: Number(form1_id),
      selected_soc_ids,
    });

    return res.status(200).json({
      success: true,
      message: "Checkbox updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Form2 Checkbox Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/*POST Submit Form2*/
export const submitForm2 = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = {
      ...req.body,
      uid, 
    };

    const data = await form2Usecases.submitForm2Usecase(payload);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form2 submitted successfully",
      data,
    });
  } catch (error: any) {
    console.error("Submit Form2 Error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};



/*GET Form2 by Logged in User*/
/*GET Form2 List*/
export const getForm2ListByUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await form2Usecases.getForm2ListByUser({
      uid: Number(user.uid),
      role: Number(user.role),
      zone_id: user.zone_id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form2 list fetched successfully",
      data,
    });

  } catch (error: any) {
    console.error("Form2 LIST error:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};

/*GET Editable Form2*/
export const getEditableForm2 = async (req: Request, res: Response) => {
  try {
    const uid = Number((req as any).user?.uid);

    if (!uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await form2Usecases.getEditableForm2(uid);

    if (!data) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No Form2 submission found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Editable Form2 fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Editable Form2 GET error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

/*PUT Edit Form2*/
export const editForm2 = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const result = await form2Usecases.editForm2(payload);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form2 edited successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Edit Form2 error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
};

/*GET FORM2 PDF*/
export const getForm2Pdf = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    await form2Usecases.getForm2PdfUsecase({
      uid: Number(user.uid),
      role: Number(user.role),
      zone_id: req.query.zone_id || user.zone_id,
      res, // important for PDF streaming
    });

    // No JSON response (PDF will be downloaded)

  } catch (error: any) {
    console.error("Form2 PDF error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
};
