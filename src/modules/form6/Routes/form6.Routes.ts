import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { form6Controller } from "../../form6/Controllers/form6.Controller";
import {
  initForm6Validation,
  loadForm6PreviewValidation,
  withdrawCandidateValidation,
  societyDecisionValidation,
  submitForm6Validation,
  editForm6Validation,
  listForm6Validation,
  getEditableForm6Validation,
} from "../../form6/Validations/form6.Schema";

const router = Router();

router.post("/init",verifyToken,validate(initForm6Validation),form6Controller.initForm6);

router.get("/preview",verifyToken,validate(loadForm6PreviewValidation),form6Controller.loadForm6Preview);

router.get("/editable",verifyToken,validate(getEditableForm6Validation),form6Controller.getEditableForm6);

router.get("/list",verifyToken,validate(listForm6Validation),form6Controller.listForm6);

router.post("/candidate-withdraw",verifyToken,validate(withdrawCandidateValidation),form6Controller.withdrawCandidate);

router.post("/society-decision",verifyToken,validate(societyDecisionValidation),form6Controller.societyDecision);

router.put("/edit",verifyToken,validate(editForm6Validation),form6Controller.editForm6);

router.post("/submit",verifyToken,validate(submitForm6Validation),form6Controller.submitForm6);

export default router;
