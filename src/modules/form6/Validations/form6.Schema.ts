import Joi from "joi";

/*INIT FORM-6*/
export const initForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

// PREVIEW FORM-6
export const loadForm6PreviewValidation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*EDITABLE FORM-6*/
export const getEditableForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*UPDATE EDIT*/
export const editForm6Validation = {
  body: Joi.object({
    societies: Joi.array()
      .items(
        Joi.object({
          form4_filed_soc_id: Joi.number()
            .integer()
            .required(),

          election_action: Joi.string()
            .valid("SHOW", "STOP")
            .required(),
        })
      )
      .min(1)
      .required(),
  }),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*CANDIDATE WITHDRAW*/
export const withdrawCandidateValidation = {
  body: Joi.object({
    form4_filed_soc_id: Joi.number()
      .integer()
      .required(),

    form5_member_id: Joi.number()
      .integer()
      .required(),
  }),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*CANDIDATE REINSTATE*/
export const reinstateCandidateValidation = {
  body: Joi.object({
    form4_filed_soc_id: Joi.number()
      .integer()
      .required(),

    form5_member_id: Joi.number()
      .integer()
      .required(),
  }),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*SOCIETY DECISION*/
export const societyDecisionValidation = {
  body: Joi.object({
    form4_filed_soc_id: Joi.number()
      .integer()
      .required(),

    election_action: Joi.string()
      .valid("SHOW", "STOP")
      .required(),
  }),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*SUBMIT FORM-6*/
export const submitForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/*LIST FORM-6*/
export const listForm6Validation = {
  body: Joi.object({}).optional(),

  params: Joi.object({}).optional(),

  query: Joi.object({
    status: Joi.string()
      .valid("DRAFT", "SUBMITTED")
      .optional(),

    department_id: Joi.number().integer().optional(),

    district_id: Joi.number().integer().optional(),

    zone_id: Joi.number().integer().optional(),
  }).optional(),
};
