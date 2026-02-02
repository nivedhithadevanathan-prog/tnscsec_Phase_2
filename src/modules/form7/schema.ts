import Joi from "joi";

export const getForm7PreviewSchema = Joi.object({});


export const submitForm7Schema = Joi.object({
  societies: Joi.array()
    .items(
      Joi.object({
        society_id: Joi.number().integer().required(),

        society_name: Joi.string().required(),

        final_sc_st_count: Joi.number().integer().min(0).required(),
        final_women_count: Joi.number().integer().min(0).required(),
        final_general_count: Joi.number().integer().min(0).required(),

        form3_total: Joi.number().integer().min(0).required(),

        casted_votes_count: Joi.number().integer().min(0).required(),

        voting_percentage: Joi.number().min(0).max(100).required(),

        ballot_box_count: Joi.number().integer().min(0).required(),

        stamp_count: Joi.number().integer().min(0).required(),

        polling_stations_count: Joi.number().integer().min(0).required(),

        election_officers_count: Joi.number().integer().min(0).required(),

        polling_suspension_count: Joi.string()
          .valid("RULE_52_18", "RULE_52A_6", "NO_ISSUES")
          .required()
      })
    )
    .min(1)
    .required()
});