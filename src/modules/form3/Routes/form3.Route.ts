import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";

import {
  getForm2ListForForm3,
  getForm3ListByUser,
  getEditableForm3,
  submitForm3,
  updateForm3,
} from "../../form3/Controllers/form3.Controller";

import {
  validate,
  submitForm3Validation,
  updateForm3Validation,
} from "../../form3/Validations/form3.Schema";

const router = Router();

/* ============================================================
   GET — Fetch Form2 list for Form3
   URL: /api/form3/form2-list
   ============================================================ */
router.get(
  "/form2-list",
  verifyToken,
  getForm2ListForForm3
);

/* ============================================================
   GET — Fetch Form3 list by logged-in user
   URL: /api/form3/list
   ============================================================ */
router.get(
  "/list",
  verifyToken,
  getForm3ListByUser
);

/* ============================================================
   GET — Fetch Editable (Latest) Form3 for Review / Edit
   URL: /api/form3/editable
   ============================================================ */
router.get(
  "/editable",
  verifyToken,
  getEditableForm3
);

/* ============================================================
   POST — Submit Form3
   URL: /api/form3/submit
   ============================================================ */
router.post(
  "/submit",
  verifyToken,
  validate(submitForm3Validation),
  submitForm3
);

/* ============================================================
   PUT — Edit & Submit Form3 Again (Before Final Confirmation)
   URL: /api/form3/edit
   ============================================================ */
router.put(
  "/edit",
  verifyToken,
  validate(updateForm3Validation),
  updateForm3
);

export default router;
