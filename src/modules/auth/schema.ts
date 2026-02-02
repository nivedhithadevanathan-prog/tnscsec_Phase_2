import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().min(1).required().messages({
    "string.empty": "Username is required",
    "any.required": "Username is required",
  }),

  password: Joi.string().min(1).required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export type LoginInput = {
  username: string;
  password: string;
};
