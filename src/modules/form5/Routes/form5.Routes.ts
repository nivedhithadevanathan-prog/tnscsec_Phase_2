import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form5Controller } from "../../form5/Controllers/form5.Controller";

const router = Router();

/**
 * 1️⃣ GET Eligible societies for Form5
 * Used before first submit
 */
router.get(
  "/eligible",
  verifyToken,
  Form5Controller.getEligibleSocieties
);

/**
 * 2️⃣ POST Submit Form5 (first submission)
 */
router.post(
  "/submit",
  verifyToken,
  Form5Controller.submitForm5
);

/**
 * 3️⃣ GET Form5 list (read-only review)
 */
router.get(
  "/list",
  verifyToken,
  Form5Controller.getForm5List
);

/**
 * 4️⃣ GET Editable Form5 (prefill for edit)
 */
router.get(
  "/editable",
  verifyToken,
  Form5Controller.getEditableForm5
);

/**
 * 5️⃣ PUT Edit Form5 (edit & submit again)
 */
router.put(
  "/edit",
  verifyToken,
  Form5Controller.editForm5
);

export default router;
