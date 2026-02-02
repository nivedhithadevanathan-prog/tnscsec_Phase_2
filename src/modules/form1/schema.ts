import Joi from "joi";

export const form1Schema = Joi.object({
  selected_soc: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        association_name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),

  non_selected_soc: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        association_name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),

  rural_details: Joi.array()
    .items(
      Joi.object({
        rurel_id: Joi.number().required(),
        sc_st: Joi.number().required(),
        women: Joi.number().required(),
        general: Joi.number().required(),
        tot_voters: Joi.number().required(),
      })
    )
    .min(1)
    .required(),

  remark: Joi.string().allow("").optional(),
});
