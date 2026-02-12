import Joi from "joi";

export const form5SubmitSchema = Joi.object({
  members: Joi.array()
    .items(
      Joi.object({
        form4_filed_soc_id: Joi.number()
          .integer()
          .positive()
          .required(),

        category_type: Joi.string()
          .valid(
            "sc_st",
            "women",
            "general",
            "sc_st_dlg",
            "women_dlg",
            "general_dlg"
          )
          .optional()
          .allow(null),

        member_name: Joi.string()
          .trim()
          .max(255)
          .required(),

        aadhar_no: Joi.string()
          .trim()
          .max(20)
          .required(),
      })
    )
    .min(1)
    .required(),
});

export const form5EditSchema = form5SubmitSchema;

export const form5ListSchema = Joi.object({});

export const form5EditableSchema = Joi.object({});

export const form5EligibleSchema = Joi.object({});
