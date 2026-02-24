import { Request, Response, NextFunction } from "express";
import Joi from "joi";

type ValidationSchema = {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
};

export const validate =
  (schema: ValidationSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const { error } = schema.body.validate(req.body, {
          abortEarly: false,
        });
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((d) => d.message),
          });
        }
      }

      if (schema.query) {
        const { error } = schema.query.validate(req.query, {
          abortEarly: false,
        });
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((d) => d.message),
          });
        }
      }

      if (schema.params) {
        const { error } = schema.params.validate(req.params, {
          abortEarly: false,
        });
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((d) => d.message),
          });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };

  