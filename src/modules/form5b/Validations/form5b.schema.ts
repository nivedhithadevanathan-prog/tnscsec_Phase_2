import Joi from "joi";

/*GET Form5B Preview*/
export const form5bPreviewSchema = Joi.object({});

export const stopSocietySchema = Joi.object({
  societies: Joi.array()
    .items(
      Joi.object({
        filed_soc_id: Joi.number()
          .integer()
          .positive()
          .required(),

        stop_remark: Joi.string()
          .trim()
          .max(500)
          .required(),
      })
    )
    .min(1)
    .required(),
});

export const stopCandidateSchema = Joi.object({
  candidates: Joi.array()
    .items(
      Joi.object({
        candidate_id: Joi.number()
          .integer()
          .positive()
          .required(),
      })
    )
    .min(1)
    .required(),
});

/*POST Submit Form5B*/
export const form5bSubmitSchema = Joi.object({});


/*GET Form5B List*/
export const form5bListSchema = Joi.object({});