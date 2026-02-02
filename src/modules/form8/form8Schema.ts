import Joi from "joi";


export const checkboxForm8Schema = Joi.object({
  societies: Joi.array().items(
    Joi.object({
      form7_society_id: Joi.number().required(),

      winners: Joi.array().items(
        Joi.object({
          form5_member_id: Joi.number().required(),
          category_type: Joi.string()
            .valid("SC_ST", "WOMEN", "GENERAL")
            .required()
        })
      ).required()
    })
  ).min(1).required()
});


const winnerSchema = Joi.object({
  form5_member_id: Joi.number().integer().required()
});

const pollingDetailsSchema = Joi.object({
  ballot_votes_at_counting: Joi.number().integer().min(0).required(),
  valid_votes: Joi.number().integer().min(0).required(),
  invalid_votes: Joi.number().integer().min(0).required(),
  remarks: Joi.string().allow(null, "").optional()
});

const societySchema = Joi.object({
  form7_society_id: Joi.number().integer().required(),

  polling_details: pollingDetailsSchema.required(),

  winners: Joi.object({
    SC_ST: Joi.array().items(winnerSchema).required(),
    WOMEN: Joi.array().items(winnerSchema).required(),
    GENERAL: Joi.array().items(winnerSchema).required()
  }).required()
});

export const submitForm8Schema = Joi.object({
  societies: Joi.array().items(societySchema).min(1).required()
});

export const getForm8Schema = Joi.object({
  form8_id: Joi.number().integer().required()
});
