import { Response } from "express";
import genericModule from "./genericResponse";
import { generate } from "./genericResponse";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
};

// So you can do: import responses from "../../../utils/response"
export default {
  sendResponse,
  sendError,
  generate,
  generic: genericModule,
};
