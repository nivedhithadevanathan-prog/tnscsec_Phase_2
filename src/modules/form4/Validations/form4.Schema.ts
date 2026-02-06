import Joi from "joi";

/* ======================================================
   1️⃣ Load Form4 (GET /form4)
   No body
====================================================== */
export const loadForm4Schema = Joi.object({});

/* ======================================================
   2️⃣ Checkbox Preview (POST /form4/checkbox)
====================================================== */
export const checkboxSchema = Joi.object({
  selected_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
});

/* ======================================================
   Shared Society Object (used in submit & edit)
====================================================== */
const societySchema = Joi.object({
  society_id: Joi.number().required(),
  society_name: Joi.string().allow(null, ""),
  rural_id: Joi.number().optional().allow(null),

  selected: Joi.boolean().required(),

  // UNFILED
  sc_st: Joi.number().optional().default(0),
  women: Joi.number().optional().default(0),
  general: Joi.number().optional().default(0),
  sc_st_dlg: Joi.number().optional().default(0),
  women_dlg: Joi.number().optional().default(0),
  general_dlg: Joi.number().optional().default(0),
  tot_voters: Joi.number().optional().default(0),

  // FILED – rural
  rural_sc_st: Joi.number().optional().default(0),
  rural_women: Joi.number().optional().default(0),
  rural_general: Joi.number().optional().default(0),

  // FILED – rural delegation
  rural_sc_st_dlg: Joi.number().optional().default(0),
  rural_women_dlg: Joi.number().optional().default(0),
  rural_general_dlg: Joi.number().optional().default(0),

  // FILED – declared
  declared_sc_st: Joi.number().optional().default(0),
  declared_women: Joi.number().optional().default(0),
  declared_general: Joi.number().optional().default(0),

  // FILED – declared delegation
  declared_sc_st_dlg: Joi.number().optional().default(0),
  declared_women_dlg: Joi.number().optional().default(0),
  declared_general_dlg: Joi.number().optional().default(0),

  election_status: Joi.string()
    .valid("QUALIFIED", "UNOPPOSED", "DISQUALIFIED")
    .optional(),

  remarks: Joi.string().optional().allow(null, ""),
});

/* ======================================================
   3️⃣ Submit Form4 (POST /form4/submit)
====================================================== */
export const submitSchema = Joi.object({
  /**
   * form4_id OPTIONAL (used only if update is triggered internally)
   */
  form4_id: Joi.number().optional().allow(null),

  department_id: Joi.number().optional().allow(null),
  district_id: Joi.number().optional().allow(null),
  district_name: Joi.string().allow(null, ""),
  zone_id: Joi.number().optional().allow(null),
  zone_name: Joi.string().allow(null, ""),

  /**
   * Society list
   */
  form1_selected_list: Joi.array()
    .items(societySchema)
    .min(1)
    .required(),
});

/* ======================================================
   7️⃣ Edit Form4 (PUT /form4)
   Same as submit, but form4_id is REQUIRED
====================================================== */
export const editForm4Schema = Joi.object({
  /**
   * REQUIRED for edit
   */
  form4_id: Joi.number()
    .integer()
    .positive()
    .required(),

  department_id: Joi.number().optional().allow(null),
  district_id: Joi.number().optional().allow(null),
  district_name: Joi.string().allow(null, ""),
  zone_id: Joi.number().optional().allow(null),
  zone_name: Joi.string().allow(null, ""),

  form1_selected_list: Joi.array()
    .items(societySchema)
    .min(1)
    .required(),
});

/* ======================================================
   4️⃣ List Form4 (GET /form4/list)
   No body
====================================================== */
export const listForm4Schema = Joi.object({});

/* ======================================================
   6️⃣ Editable Form4 (GET /form4/editable)
   No body
====================================================== */
export const getEditableForm4Schema = Joi.object({});

/* ======================================================
   5️⃣ Get Form4 Details (GET /form4/:form4_id)
====================================================== */
export const getForm4DetailsSchema = Joi.object({
  form4_id: Joi.number()
    .integer()
    .positive()
    .required(),
});
