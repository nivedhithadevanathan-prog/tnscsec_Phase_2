import { Request, Response } from "express";
import { form3Usecases } from "../../form3/Usecases/form3.Usecase";


/*GET Form2 list for Form3*/
export const getForm2ListForForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.uid;
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

/* GET Form3 list */
export const getForm3ListByUser = async (req: any, res: Response) => {
  try {
    const user = req.user;

    if (!user?.uid || !user?.role) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User information missing",
      });
    }

    const data = await form3Usecases.getForm3ListByUser({
      uid: Number(user.uid),
      role: Number(user.role),
    });

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

/*GET Editable*/
export const getEditableForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.uid;

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

/*POST Submit Form3*/
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

/*PUT Edit & Submit Form3 Again*/
export const updateForm3 = async (req: any, res: Response) => {
  try {
    const uid = req.user?.uid;

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
