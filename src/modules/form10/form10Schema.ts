import Joi from "joi";

export const rejectSchema = Joi.object({
  form10_id: Joi.number().required(),
  form10_society_id: Joi.number().required(),
  candidates: Joi.array().items(
    Joi.object({
      form5_member_id: Joi.number().required(),
      remarks: Joi.string().allow("", null)
    })
  ).min(1).required()
});

export const withdrawSchema = Joi.object({
  form10_id: Joi.number().required(),
  form10_society_id: Joi.number().required(),
  candidates: Joi.array().items(
    Joi.object({
      form5_member_id: Joi.number().required(),
      remarks: Joi.string().allow("", null)
    })
  ).min(1).required()
});

export const finalizeSchema = Joi.object({
  form10_society_id: Joi.number().required(),
  election_type: Joi.string()
    .valid("UNOPPOSED", "POLL")
    .required(),
  vice_president_form5_candidate_id: Joi.number().required()
});

export const submitSchema = Joi.object({
  form10_id: Joi.number().required()
});

export const initForm10Schema = Joi.object({}).required();
