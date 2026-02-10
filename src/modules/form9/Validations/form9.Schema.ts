import Joi from "joi";

export const initForm9Schema = {
  body: Joi.object({}).unknown(false),
};

export const previewForm9Schema = {
  query: Joi.object({}).unknown(false),
};


// form9.Schema.ts
export const rejectForm9Schema = {
  body: Joi.object({
    form9_id: Joi.number().integer().required(),

    form9_society_id: Joi.number().integer().required(),

    candidates: Joi.array()
      .items(
        Joi.object({
          form5_member_id: Joi.number().integer().required(),
          remarks: Joi.string().allow("", null),
        })
      )
      .optional()
      .min(1),
  }),
};



export const withdrawForm9Schema = {
  body: Joi.object({
    form9_id: Joi.number().required(),

    form9_society_id: Joi.number().required(),

    candidates: Joi.array()
      .items(
        Joi.object({
          form5_member_id: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
  }),
};

export const finalForm9Schema = {
  body: Joi.object({
    form9_id: Joi.number().integer().positive().required(),
    form9_society_id: Joi.number().integer().positive().required(),
    election_type: Joi.string().valid("UNOPPOSED", "POLL").required(),
    president_form5_candidate_id: Joi.number().integer().positive().allow(null),
  }),
};

export const listForm9Schema = {
  // LIST has no body / query — uid comes from token
};
