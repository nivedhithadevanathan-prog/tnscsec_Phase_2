import Joi from "joi";

export const checkboxSchema = Joi.object({
  selected_ids: Joi.array().items(Joi.number()).required(),
});

export const submitSchema = Joi.object({
  form4_id: Joi.number().optional().allow(null),
  department_id: Joi.number().allow(null),
  district_id: Joi.number().allow(null),
  district_name: Joi.string().allow("", null),
  zone_id: Joi.number().allow(null),
  zone_name: Joi.string().allow("", null),

  form2_selected_list: Joi.array()
    .items(
      Joi.object({
        society_id: Joi.number().required(),
        society_name: Joi.string().allow("", null),
        rural_id: Joi.number().allow(null),
        selected: Joi.boolean().required(),
        declared_sc_st: Joi.number().default(0),
        declared_women: Joi.number().default(0),
        declared_general: Joi.number().default(0),
        remarks: Joi.string().allow("", null),
      })
    )
    .min(1)
    .required(),
});
