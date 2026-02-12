import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const form3GetValidation = Joi.object({
  uid: Joi.number().integer().required(),
});

/*SUBMIT Validation*/
export const submitForm3Validation = Joi.object({
  uid: Joi.number().required(),

  form2_id: Joi.number().required(),

  department_id: Joi.number().required(),

  district_id: Joi.number().required(),
  district_name: Joi.string().required(),

  zone_id: Joi.number().required(),
  zone_name: Joi.string().required(),

  remarks: Joi.string().allow(null, "").optional(),

  selected_societies: Joi.array()
    .items(
      Joi.object({
        society_id: Joi.number().required(),
        society_name: Joi.string().required(),

        ass_memlist: Joi.string().allow(null, "").optional(),
        ero_claim: Joi.string().allow(null, "").optional(),

        jcount: Joi.number().allow(null).optional(),
        rcount: Joi.number().allow(null).optional(),
        total: Joi.number().allow(null).optional(),

        rural_id: Joi.number().allow(null).optional(),
        tot_voters: Joi.number().allow(null).optional(),
      })
    )
    .min(1)
    .required(),
});

/*EDIT Validation*/
export const updateForm3Validation = Joi.object({
  form3_id: Joi.number().required(),

  remarks: Joi.string().allow(null, "").optional(),

  selected_societies: Joi.array()
    .items(
      Joi.object({
        society_id: Joi.number().required(),
        society_name: Joi.string().required(),

        ass_memlist: Joi.number().allow(null).optional(),
        ero_claim: Joi.number().allow(null).optional(),

        jcount: Joi.number().allow(null).optional(),
        rcount: Joi.number().allow(null).optional(),

        total: Joi.number().allow(null).optional(),
        rural_id: Joi.number().allow(null).optional(),
        tot_voters: Joi.number().allow(null).optional(),
      })
    )
    .min(1)
    .required(),
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
        statusCode: 400,
        message: "Validation error",
        details: error.details,
      });
    }

    req.body = value;
    next();
  };
