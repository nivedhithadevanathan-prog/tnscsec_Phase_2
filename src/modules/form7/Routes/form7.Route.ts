import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { Form7Controller } from "../../form7/Controllers/form7.Controller";

import {
  previewForm7Validation,
  submitForm7Validation,
  editForm7Validation,
  listForm7Validation,
  editableForm7Validation,
} from "../../form7/Validations/form7.Schema";


const router = Router();

/**
 * =====================================================
 * 1️⃣ GET: Form7 Preview (Before Submit)
 * =====================================================
 * READ-ONLY
 */
router.get(
  "/preview",
  verifyToken,
  validate(previewForm7Validation),
  Form7Controller.preview
);

/**
 * =====================================================
 * 2️⃣ POST: Submit Form7
 * =====================================================
 */
router.post(
  "/submit",
  verifyToken,
  validate(submitForm7Validation),
  Form7Controller.submit
);

/**
 * =====================================================
 * 3️⃣ GET: Form7 List (All submitted Form7)
 * =====================================================
 */
router.get(
  "/list",
  verifyToken,
  validate(listForm7Validation),
  Form7Controller.list
);

/**
 * =====================================================
 * 4️⃣ GET: Editable Form7 (Review Screen)
 * =====================================================
 */
router.get(
  "/editable",
  verifyToken,
  validate(editableForm7Validation),
  Form7Controller.editable
);

/**
 * =====================================================
 * 5️⃣ PUT: Edit Form7 (Before Final Confirm)
 * =====================================================
 */
router.put(
  "/edit",
  verifyToken,
  validate(editForm7Validation),
  Form7Controller.edit
);

export default router;
