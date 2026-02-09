import Joi from "joi";

/**
 * =====================================================
 * FORM 8 – PREVIEW API
 * GET /api/form8/preview
 * =====================================================
 * No request body
 */
export const Form8PreviewSchema = Joi.object({}).required();


/**
 * =====================================================
 * FORM 8 – CHECKBOX PREVIEW API
 * GET /api/form8/checkbox-preview
 * =====================================================
 * No request body
 */
export const Form8CheckboxPreviewSchema = Joi.object({}).required();


/**
 * =====================================================
 * FORM 8 – FINAL RESULT (SAVE)
 * POST /api/form8/final-result
 * =====================================================
 * Winner-based payload (NO COUNTS)
 * Supports DLG categories
 */
export const Form8FinalResultSchema = Joi.object({
  form7_society_id: Joi.number()
    .integer()
    .required(),

  winners: Joi.object({
    SC_ST: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),

    WOMEN: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),

    GENERAL: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),

    // ✅ DLG CATEGORIES
    SC_ST_DLG: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),

    WOMEN_DLG: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),

    GENERAL_DLG: Joi.array()
      .items(
        Joi.number().integer().positive()
      )
      .optional(),
  })
    .min(1)
    .required(),
}).required();


/**
 * =====================================================
 * FORM 8 – SUBMIT API
 * POST /api/form8/submit
 * =====================================================
 * Saves polling details per society
 */
export const Form8SubmitSchema = Joi.object({
  societies: Joi.array()
    .items(
      Joi.object({
        form7_society_id: Joi.number()
          .integer()
          .required(),

        polling_details: Joi.object({
          ballot_votes_at_counting: Joi.number()
            .integer()
            .min(0)
            .required(),

          valid_votes: Joi.number()
            .integer()
            .min(0)
            .required(),

          invalid_votes: Joi.number()
            .integer()
            .min(0)
            .required(),

          remarks: Joi.string()
            .allow("", null)
            .optional(),
        }).required(),
      })
    )
    .min(1)
    .required(),
}).required();


/**
 * =====================================================
 * FORM 8 – LIST API
 * GET /api/form8/list
 * =====================================================
 * No request body
 */
export const Form8ListSchema = Joi.object({}).required();
