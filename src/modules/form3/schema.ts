import Joi from "joi";

export const form3Schema = Joi.object({
  form2_id: Joi.number().required().messages({
    "any.required": "form2_id is required",
    "number.base": "form2_id must be a number",
  }),

  remarks: Joi.string().allow("", null).optional(),

  society_entries: Joi.array()
    .items(
      Joi.object({
        society_id: Joi.number().required(),
        society_name: Joi.string().required(),
        ass_memlist: Joi.string().allow("", null).optional(),
        ero_claim: Joi.string().allow("", null).optional(),
        jcount: Joi.number().allow(null).optional(),
        rcount: Joi.number().allow(null).optional(),
        total: Joi.number().allow(null).optional(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one society entry is required",
      "any.required": "society_entries is required",
    }),
});
