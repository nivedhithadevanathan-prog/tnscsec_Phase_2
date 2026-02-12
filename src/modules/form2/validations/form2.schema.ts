
import Joi from "joi";
import { Request, Response, NextFunction } from "express";

/*GET Form1 Selected Societies*/
export const getForm2Validation = Joi.object({
  form1_id: Joi.number().required().messages({
    "any.required": "form1_id is required",
    "number.base": "form1_id must be a number",
  }),
});

/*POST Checkbox Selection*/
export const checkboxForm2Validation = Joi.object({
  form2_id: Joi.number().required().messages({
    "any.required": "form2_id is required",
    "number.base": "form2_id must be a number",
  }),

  selected_soc_ids: Joi.array()
    .items(Joi.number().required())
    .default([])
    .messages({
      "array.base": "selected_soc_ids must be an array of numbers",
      "number.base": "Each society_id must be a number",
    }),
});

/*POST Submit Form2*/
export const submitForm2Validation = Joi.object({
  uid: Joi.number().required().messages({
    "any.required": "uid is required",
    "number.base": "uid must be a number",
  }),

  department_id: Joi.number().allow(null).optional(),
  district_id: Joi.number().allow(null).optional(),
  zone_id: Joi.number().allow(null).optional(),

  form1_id: Joi.number().required().messages({
    "any.required": "form1_id is required",
  }),

  masterzone_count: Joi.number().allow(null).optional(),

  remark: Joi.string().allow("", null).optional(),

  selected_soc_ids: Joi.array()
    .items(Joi.number().required())
    .required()
    .messages({
      "array.base": "selected_soc_ids must be an array",
    }),
    non_selected_soc_ids: Joi.array()
    .items(Joi.number().required())
    .required()
    .messages({
      "array.base": "non_selected_soc_ids must be an array",
    }),
});

/*GET Form2 LIST*/
export const getForm2ListValidation = Joi.object({});

/*GET Editable Form2*/
export const getEditableForm2Validation = Joi.object({});

/*PUT Edit Form2*/
export const editForm2Validation = Joi.object({
  uid: Joi.number().required().messages({
    "any.required": "uid is required",
    "number.base": "uid must be a number",
  }),

  form2_id: Joi.number().required().messages({
    "any.required": "form2_id is required",
    "number.base": "form2_id must be a number",
  }),

  department_id: Joi.number().allow(null).optional(),
  district_id: Joi.number().allow(null).optional(),
  zone_id: Joi.number().allow(null).optional(),

  masterzone_count: Joi.number().allow(null).optional(),

  remark: Joi.string().allow("", null).optional(),

  selected_soc_ids: Joi.array()
    .items(Joi.number().required())
    .required()
    .messages({
      "array.base": "selected_soc_ids must be an array of numbers",
    }),
});

/*COMMON VALIDATION MIDDLEWARE*/
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details,
      });
    }

    req.body = value;
    next();
  };
