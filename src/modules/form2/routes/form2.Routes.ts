
import { Router } from "express";
import {
  getForm2SelectedSocieties,
  checkboxForm2,
  submitForm2,
  getForm2ListByUser,
  getEditableForm2,
  editForm2,             
} from "../Controllers/form2.Controller";

import { verifyToken } from "../../../middleware/auth.middleware";

import {
  validate,
  editForm2Validation,   
} from "../Validations/form2.schema";

const router = Router();

router.get("/list", verifyToken, getForm2ListByUser);
router.get("/editable", verifyToken, getEditableForm2);
router.put("/edit",verifyToken,validate(editForm2Validation),editForm2);
router.get("/get", verifyToken, getForm2SelectedSocieties);
router.post("/checkbox", verifyToken, checkboxForm2);
router.post("/submit", verifyToken, submitForm2);

export default router;
