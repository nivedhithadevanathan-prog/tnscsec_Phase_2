
import { Router } from "express";
import {
  getForm2SelectedSocieties,
  checkboxForm2,
  submitForm2,
  getForm2ListByUser,
  getEditableForm2,
  editForm2,              // ✅ ADD
} from "../Controllers/form2.Controller";

import { verifyToken } from "../../../middleware/auth.middleware";

import {
  validate,
  editForm2Validation,    // ✅ ADD
} from "../Validations/form2.schema";

const router = Router();

/* ---------------------------------------------------------
   LIST — All Form2 submissions by logged-in user
---------------------------------------------------------- */
router.get("/list", verifyToken, getForm2ListByUser);

/* ---------------------------------------------------------
   API-1 — Editable Form2 (Latest submission)
---------------------------------------------------------- */
router.get("/editable", verifyToken, getEditableForm2);

/* ---------------------------------------------------------
   API-2 — Edit Form2 (Before Form3)
---------------------------------------------------------- */
router.put(
  "/edit",
  verifyToken,
  validate(editForm2Validation),
  editForm2
);

/* ---------------------------------------------------------
   EXISTING ROUTES (UNCHANGED)
---------------------------------------------------------- */
router.get("/get", verifyToken, getForm2SelectedSocieties);
router.post("/checkbox", verifyToken, checkboxForm2);
router.post("/submit", verifyToken, submitForm2);

export default router;
