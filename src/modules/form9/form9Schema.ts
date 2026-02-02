import Joi from "joi";

export const rejectSchema = Joi.object({
  form9_id: Joi.number().required(),
  form9_society_id: Joi.number().required(),
  candidates: Joi.array().items(
    Joi.object({
      form5_member_id: Joi.number().required(),
      remarks: Joi.string().allow("", null)
    })
  ).min(1).required()
});

export const withdrawSchema = Joi.object({
  form9_id: Joi.number().required(),          // ✅ ADD THIS
  form9_society_id: Joi.number().required(),
  candidates: Joi.array()
    .items(
      Joi.object({
        form5_member_id: Joi.number().required(),
        remarks: Joi.string().allow("", null),
      })
    )
    .min(1)
    .required(),
});


export const finalizeSchema = Joi.object({
  form9_society_id: Joi.number().required(),

  election_type: Joi.string()
    .valid("UNOPPOSED", "POLL")
    .required(),

  // ✅ REQUIRED FOR BOTH POLL & UNOPPOSED
  president_form5_candidate_id: Joi.number().required()
});




export const submitSchema = Joi.object({
  form9_id: Joi.number().required()
});

export const initForm9Schema = Joi.object({}).required();


