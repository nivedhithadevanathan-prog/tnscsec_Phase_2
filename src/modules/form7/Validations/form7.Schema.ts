import Joi from "joi";

/*COMMON ENUMS*/
const pollingSuspensionEnum = Joi.string().valid(
  "RULE_52_18",
  "RULE_52A_6",
  "NO_ISSUES"
);

/*PREVIEW*/
export const previewForm7Validation = {
  params: Joi.object({}),
  query: Joi.object({}),
  body: Joi.object({}),
};

/*LIST*/
export const listForm7Validation = {
  params: Joi.object({}).optional(),

  query: Joi.object({
    department_id: Joi.number().optional(),
    district_id: Joi.number().optional(),
    zone_id: Joi.number().optional(),
  }).optional(),

  body: Joi.object({}).optional(),
};

/*EDITABLE*/
export const editableForm7Validation = {
  params: Joi.object({}),
  query: Joi.object({}),
  body: Joi.object({}),
};

/*SOCIETY OBJECT*/
const form7SocietySchema = Joi.object({
  society_id: Joi.number().integer().required(),
  society_name: Joi.string().trim().required(),

  final_sc_st_count: Joi.number().integer().min(0).required(),
  final_women_count: Joi.number().integer().min(0).required(),
  final_general_count: Joi.number().integer().min(0).required(),

  final_sc_st_dlg_count: Joi.number().integer().min(0).required(),
  final_women_dlg_count: Joi.number().integer().min(0).required(),
  final_general_dlg_count: Joi.number().integer().min(0).required(),

  form3_total: Joi.number().integer().min(0).required(),
  casted_votes_count: Joi.number().integer().min(0).required(),
  voting_percentage: Joi.number().min(0).max(100).required(),

  ballot_box_count: Joi.number().integer().min(0).required(),
  stamp_count: Joi.number().integer().min(0).required(),
  polling_stations_count: Joi.number().integer().min(0).required(),
  election_officers_count: Joi.number().integer().min(0).required(),

  polling_suspension_count: pollingSuspensionEnum.required(),
});

/*SUBMIT*/
export const submitForm7Validation = {
  body: Joi.object({
    societies: Joi.array()
      .items(form7SocietySchema)
      .min(1)
      .required(),
  }),
};

/*EDIT*/
export const editForm7Validation = {
  body: Joi.object({
    societies: Joi.array()
      .items(form7SocietySchema)
      .min(1)
      .required(),
  }),
};
