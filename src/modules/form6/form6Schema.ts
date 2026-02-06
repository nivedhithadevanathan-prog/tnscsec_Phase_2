// import Joi from "joi";

// export const candidateEventSchema = Joi.object({
//   form6_id: Joi.number().required(),

//   form4_filed_soc_id: Joi.number().required().messages({
//     "number.base": "form4_filed_soc_id must be a number",
//     "any.required": "form4_filed_soc_id is required",
//   }),

//   form5_member_id: Joi.number().required().messages({
//     "number.base": "form5_member_id must be a number",
//     "any.required": "form5_member_id is required",
//   }),

//   event_type: Joi.string()
//     .valid("WITHDRAW", "REINSTATE")
//     .required()
//     .messages({
//       "any.only": "event_type must be WITHDRAW or REINSTATE",
//     }),
// });

// export const updateElectionActionSchema = Joi.object({
//   form6_id: Joi.number().required(),
//   form4_filed_soc_id: Joi.number().required(),
//   action: Joi.string().valid("SHOW", "STOP").required(),
// });
// export const simulateForm6Schema = Joi.object({
//   form4_filed_soc_id: Joi.number().required().messages({
//     "number.base": "form4_filed_soc_id must be a number",
//     "any.required": "form4_filed_soc_id is required",
//   }),

//   withdraw_member_ids: Joi.array()
//     .items(Joi.number())
//     .required()
//     .messages({
//       "array.base": "withdraw_member_ids must be an array of numbers",
//     }),
// });

// export const stopElectionSchema = Joi.object({
//   form6_id: Joi.number().required(),
//   form4_filed_soc_id: Joi.number().required(),
//   action: Joi.string().valid("STOP", "SHOW").required(),
// });

// /* SUBMIT FORM6 */
// export const submitForm6Schema = Joi.object({
//   form6_id: Joi.number().required(),
// });
// export const initForm6Schema = Joi.object({});

// export const withdrawCandidateSchema = Joi.object({
//   form6_id: Joi.number().required(),
//   form5_member_id: Joi.number().required(),
//   action: Joi.string().valid("WITHDRAW", "REINSTATE").required(),
// });
