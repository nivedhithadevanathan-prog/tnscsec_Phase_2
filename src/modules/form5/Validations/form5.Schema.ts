import Joi from "joi";

/* ======================================================
   1️⃣ SUBMIT Form5
   POST /api/form5/submit
   ====================================================== */
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

/* ======================================================
   2️⃣ EDIT Form5
   PUT /api/form5/edit
   (Same payload as submit)
   ====================================================== */
export const form5EditSchema = form5SubmitSchema;

/* ======================================================
   3️⃣ LIST Form5 (Review screen)
   GET /api/form5/list
   ====================================================== */
export const form5ListSchema = Joi.object({});

/* ======================================================
   4️⃣ EDITABLE Form5 (Prefill for edit)
   GET /api/form5/editable
   ====================================================== */
export const form5EditableSchema = Joi.object({});

/* ======================================================
   5️⃣ ELIGIBLE Societies for Form5
   GET /api/form5/eligible
   ====================================================== */
export const form5EligibleSchema = Joi.object({});
