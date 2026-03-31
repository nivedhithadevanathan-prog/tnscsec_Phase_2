
import { Request, Response } from "express";
import {
  getCheckpointZonesUsecase,
  submitForm1Usecase,
  getMasterZonesUsecase,
  getRuralDetailsUsecase,
  getForm1ListUsecase,
  getEditableForm1Usecase,
  editEditableForm1Usecase,
} from "../../form1/Usecases/form1.Usecase";

/*GET CHECKPOINT ZONES*/
export const getCheckpointZones = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User ID missing in token",
      });
    }

    const selectedIds: number[] = req.body.selectedIds || [];

    const data = await getCheckpointZonesUsecase(user.uid, selectedIds);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Checkpoint zones fetched successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || "Internal server error",
    });
  }
};

// SUBMIT FORM 1 
export const submitForm1 = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User ID missing in token",
      });
    }

    const payload = {
      uid: Number(user.uid),
      department_id: user.department_id,
      district_id: user.district_id,
      zone_id: user.zone_id,
      ...req.body,
    };

    const data = await submitForm1Usecase(payload);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form-1 submitted successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || "Internal server error",
    });
  }
};

/*GET MASTER ZONES*/
export const getMasterZones = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User ID missing in token",
      });
    }

    const data = await getMasterZonesUsecase(user.uid);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Master zones fetched successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || "Internal server error",
    });
  }
};

/*GET RURAL DETAILS*/
export const getRuralDetails = async (req: Request, res: Response) => {
  try {
    const ids: number[] = req.body.associationIds;

    const data = await getRuralDetailsUsecase(ids);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Rural details fetched successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || "Internal server error",
    });
  }
};

export const getForm1List = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid || !user?.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await getForm1ListUsecase({
      uid: Number(user.uid),
      role: Number(user.role),
      zone_id: user.zone_id, 
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form1 list fetched successfully",
      data,
    });

  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || "Internal server error",
    });
  }
};


/*GET EDITABLE FORM1*/
export const getEditableForm1 = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User ID missing in token",
      });
    }

    const uid = Number(user.uid); 

    const data = await getEditableForm1Usecase(uid);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Editable Form1 fetched successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || "Internal server error",
    });
  }
};

/*EDIT FORM1*/
export const editForm1 = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.uid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User ID missing in token",
      });
    }

    const payload = {
      uid: Number(user.uid),
      department_id: user.department_id,
      district_id: user.district_id,
      zone_id: user.zone_id,
      ...req.body,
    };

    const data = await editEditableForm1Usecase(payload);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Form1 updated successfully",
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message || "Unable to update Form1",
    });
  }
};
