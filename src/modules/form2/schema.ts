import Joi from "joi";

export const checkboxSchema = Joi.object({
  form1_id: Joi.number().required(),
  selectedIds: Joi.array().items(Joi.number()).required(),
});

export const submitForm2Schema = Joi.object({
  form1_id: Joi.number().required(),
  selectedIds: Joi.array().items(Joi.number()).required(),
  remark: Joi.string().allow("").optional(),
});
