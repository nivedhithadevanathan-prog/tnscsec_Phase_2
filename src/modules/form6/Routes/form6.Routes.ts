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

/*INIT FORM-6*/
router.post(
  "/init",
  verifyToken,
  validate(initForm6Validation),
  form6Controller.initForm6
);

/*PREVIEW FORM-6*/
router.get(
  "/preview",
  verifyToken,
  validate(loadForm6PreviewValidation),
  form6Controller.loadForm6Preview
);

/*EDITABLE FORM-6*/
router.get(
  "/editable",
  verifyToken,
  validate(getEditableForm6Validation),
  form6Controller.getEditableForm6
);

/*LIST FORM-6*/
router.get(
  "/list",
  verifyToken,
  validate(listForm6Validation),
  form6Controller.listForm6
);

/*CANDIDATE WITHDRAW / REINSTATE*/
router.post(
  "/candidate-withdraw",
  verifyToken,
  validate(withdrawCandidateValidation),
  form6Controller.withdrawCandidate
);

/*SOCIETY DECISION (SHOW / STOP)*/
router.post(
  "/society-decision",
  verifyToken,
  validate(societyDecisionValidation),
  form6Controller.societyDecision
);

/*EDIT FORM-6*/
router.put(
  "/edit",
  verifyToken,
  validate(editForm6Validation),
  form6Controller.editForm6
);

/*SUBMIT FORM-6*/
router.post(
  "/submit",
  verifyToken,
  validate(submitForm6Validation),
  form6Controller.submitForm6
);

export default router;
