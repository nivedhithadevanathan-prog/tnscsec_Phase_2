import { Request, Response } from "express";
import { AuthUsecase } from "./authUsecase";
import { loginSchema } from "./schema";
import { sendResponse, sendError } from "../../utils/response";

export const authController = {
 async login(req: Request, res: Response) {
  try {
    // Joi validation
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return sendError(
        res,
        400,
        "Validation failed",
        error.details.map((err) => err.message)
      );
    }

    const { username, password } = value;

    const result = await AuthUsecase.login(username, password);

    if (!result) {
      return sendError(res, 401, "Invalid username or password");
    }

    return sendResponse(res, 200, "Login successful", result);

  } catch (error: any) {
    return sendError(res, 500, "Internal server error", error.message);
  }
},
};
