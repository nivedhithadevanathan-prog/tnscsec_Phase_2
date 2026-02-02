import Joi from "joi";

export const submitForm5Schema = Joi.object({
  form4_id: Joi.number().optional().allow(null),

  members: Joi.array()
    .items(
      Joi.object({
        form4_filed_soc_id: Joi.number().required().messages({
          "any.required": "form4_filed_soc_id is required",
          "number.base": "form4_filed_soc_id must be a number",
        }),
        category_type: Joi.string()
          .valid("sc_st", "women", "general")
          .required(),
        member_name: Joi.string().min(1).required(),
        aadhar_no: Joi.string()
          .pattern(/^[0-9]{12}$/)
          .message("aadhar_no must be 12 digits")
          .required(),
      })
    )
    .min(1)
    .required(),
});
