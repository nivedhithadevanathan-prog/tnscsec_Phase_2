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

router.get("/form2-list",verifyToken,getForm2ListForForm3);

router.get("/list",verifyToken,getForm3ListByUser);

router.get("/editable",verifyToken,getEditableForm3);

router.post("/submit",verifyToken,validate(submitForm3Validation),submitForm3);

router.put("/edit",verifyToken,validate(updateForm3Validation),updateForm3);

export default router;
