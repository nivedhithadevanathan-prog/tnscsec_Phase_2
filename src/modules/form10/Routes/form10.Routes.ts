import { Router } from "express";
import { Form10Controller } from "../../form10/Controllers/form10.Controller";
import { validate } from "../../../middleware/validate.middleware";
import { verifyToken } from "../../../middleware/auth.middleware";
import { initForm10Schema } from "../Validations/form10.Schema";
import { previewForm10Schema } from "../Validations/form10.Schema";
import { rejectForm10Schema } from "../Validations/form10.Schema";
import { withdrawForm10Schema } from "../Validations/form10.Schema";
import { finalForm10Schema } from "../Validations/form10.Schema";
import { submitForm10Schema } from "../Validations/form10.Schema";





const router = Router();

/* =====================================================
 * FORM10 INIT
 * POST /form10/init
 * ===================================================== */
router.post(
  "/init",
  verifyToken,
  validate(initForm10Schema),
  Form10Controller.init
);

/* =====================================================
 * FORM10 PREVIEW
 * GET /form10/preview
 * ===================================================== */
router.get(
  "/preview",
  verifyToken,
  validate(previewForm10Schema),
  Form10Controller.preview
);

/* =====================================================
 * FORM10 REJECT CANDIDATES
 * POST /form10/reject
 * ===================================================== */
router.post(
  "/reject",
  verifyToken,
  validate(rejectForm10Schema),
  Form10Controller.reject
);


/* =====================================================
 * FORM10 WITHDRAW CANDIDATES
 * POST /form10/withdraw
 * ===================================================== */
router.post(
  "/withdraw",
  verifyToken,
  validate(withdrawForm10Schema),
  Form10Controller.withdraw
);

/* =====================================================
 * FORM10 FINAL (PER SOCIETY)
 * POST /form10/final
 * ===================================================== */
router.post(
  "/final",
  verifyToken,
  validate(finalForm10Schema),
  Form10Controller.final
);

/* =====================================================
 * FORM10 SUBMIT
 * POST /form10/submit
 * ===================================================== */
router.post(
  "/submit",
  verifyToken,
  validate(submitForm10Schema),
  Form10Controller.submit
);

/* =====================================================
 * FORM10 LIST
 * GET /form10/list
 * ===================================================== */
router.get(
  "/list",
  verifyToken,
  Form10Controller.list
);


export default router;

