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

/* =====================================================
 * 1️⃣ INIT FORM-6
 * POST /form6/init
 * ===================================================== */
router.post(
  "/init",
  verifyToken,
  validate(initForm6Validation),
  form6Controller.initForm6
);

/* =====================================================
 * 2️⃣ PREVIEW FORM-6 (LIVE VIEW)
 * GET /form6/preview
 * ===================================================== */
router.get(
  "/preview",
  verifyToken,
  validate(loadForm6PreviewValidation),
  form6Controller.loadForm6Preview
);

/* =====================================================
 * 3️⃣ EDITABLE FORM-6 (REVIEW SCREEN)
 * GET /form6/editable
 * ===================================================== */
router.get(
  "/editable",
  verifyToken,
  validate(getEditableForm6Validation),
  form6Controller.getEditableForm6
);

/* =====================================================
 * 4️⃣ LIST FORM-6 (SUBMITTED LIST)
 * GET /form6/list
 * ===================================================== */
router.get(
  "/list",
  verifyToken,
  validate(listForm6Validation),
  form6Controller.listForm6
);

/* =====================================================
 * 5️⃣ CANDIDATE WITHDRAW / REINSTATE
 * POST /form6/candidate-withdraw
 * ===================================================== */
router.post(
  "/candidate-withdraw",
  verifyToken,
  validate(withdrawCandidateValidation),
  form6Controller.withdrawCandidate
);

/* =====================================================
 * 6️⃣ SOCIETY DECISION (SHOW / STOP)
 * POST /form6/society-decision
 * ===================================================== */
router.post(
  "/society-decision",
  verifyToken,
  validate(societyDecisionValidation),
  form6Controller.societyDecision
);

/* =====================================================
 * 7️⃣ EDIT FORM-6 (UPDATE ONCE BEFORE CONFIRM)
 * PUT /form6/edit
 * ===================================================== */
router.put(
  "/edit",
  verifyToken,
  validate(editForm6Validation),
  form6Controller.editForm6
);

/* =====================================================
 * 8️⃣ SUBMIT FORM-6
 * POST /form6/submit
 * ===================================================== */
router.post(
  "/submit",
  verifyToken,
  validate(submitForm6Validation),
  form6Controller.submitForm6
);

export default router;
