import Joi from "joi";

/* =====================================================
 * 1️⃣ INIT FORM-6
 * POST /form6/init
 * ===================================================== */
export const initForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/* =====================================================
 * 2️⃣ PREVIEW FORM-6 (DRAFT)
 * GET /form6/preview
 * ===================================================== */
export const loadForm6PreviewValidation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/* =====================================================
 * 3️⃣ EDITABLE FORM-6 (AFTER SUBMIT)
 * GET /form6/editable
 * ===================================================== */
export const getEditableForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/* =====================================================
 * 4️⃣ UPDATE / EDIT FORM-6
 * PUT /form6/edit
 * ===================================================== */
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

/* =====================================================
 * 5️⃣ CANDIDATE WITHDRAW
 * POST /form6/candidate-withdraw
 * ===================================================== */
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

/* =====================================================
 * 6️⃣ CANDIDATE REINSTATE
 * POST /form6/candidate-reinstate
 * ===================================================== */
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

/* =====================================================
 * 7️⃣ SOCIETY DECISION (SHOW / STOP)
 * POST /form6/society-decision
 * ===================================================== */
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

/* =====================================================
 * 8️⃣ SUBMIT FORM-6
 * POST /form6/submit
 * ===================================================== */
export const submitForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
};

/* =====================================================
 * 9️⃣ LIST FORM-6 (SUBMITTED LIST)
 * GET /form6/list
 * ===================================================== */
export const listForm6Validation = {
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    status: Joi.string()
      .valid("DRAFT", "SUBMITTED")
      .optional(),
  }).optional(),
};
