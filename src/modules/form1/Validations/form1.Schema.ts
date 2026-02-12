import Joi from "joi";

/*CHECKPOINT ZONES*/ 
export const checkpointZonesSchema = Joi.object({
  selectedIds: Joi.array().items(Joi.number().integer().positive()).default([]),
});

/*FORM1 SUBMIT*/ 
export const form1SubmitSchema = Joi.object({
  remark: Joi.string().max(150).optional(),
  selected_soc: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        association_name: Joi.string().required(),
      }),
    )
    .required(),
  non_selected_soc: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        association_name: Joi.string().required(),
      }),
    )
    .required(),
  rural_details: Joi.array()
    .items(
      Joi.object({
        rurel_id: Joi.number().required(),
        sc_st: Joi.number().min(0).required(),
        women: Joi.number().min(0).required(),
        general: Joi.number().min(0).required(),
        tot_voters: Joi.number().min(0).required(),
      }),
    )
    .required(),
});

/*RURAL DETAILS REQUEST SCHEMA*/ 
export const ruralDetailsRequestSchema =
  Joi.object({
    associationIds: Joi.array()
      .items(Joi.number().integer().positive())
      .required(),
  });
