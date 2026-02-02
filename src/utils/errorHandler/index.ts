import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // If the error is an instance of AppError (custom)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Unexpected error
  console.error("UNEXPECTED ERROR => ", err);

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: err?.message || "Something went wrong",
    error: err,
  });
};
