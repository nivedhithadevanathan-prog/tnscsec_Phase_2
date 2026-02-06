import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form4Controller } from "../../form4/Controllers/form4.Controller";

const router = Router();

/**
 * 1️⃣ Load Form4 base data
 * Used when creating a new Form4
 */
router.get(
  "/",
  verifyToken,
  Form4Controller.loadForm4
);

/**
 * 2️⃣ Checkbox preview
 * Preview filed vs unfiled societies
 */
router.post(
  "/checkbox",
  verifyToken,
  Form4Controller.checkboxUpdate
);

/**
 * 3️⃣ Submit Form4 (CREATE)
 * Initial submission
 */
router.post(
  "/submit",
  verifyToken,
  Form4Controller.submitForm4
);

/**
 * 7️⃣ Edit Form4 (UPDATE before Form5)
 * Used when user clicks "Edit & Submit again"
 */
router.put(
  "/",
  verifyToken,
  Form4Controller.editForm4
);

/**
 * 4️⃣ List all Form4 of logged-in user
 */
router.get(
  "/list",
  verifyToken,
  Form4Controller.getForm4List
);

/**
 * 6️⃣ Editable Form4 (Review + Prefill)
 * ⚠️ STATIC route — MUST be before :form4_id
 */
router.get(
  "/editable",
  verifyToken,
  Form4Controller.getEditableForm4
);

/**
 * 5️⃣ Get Form4 details by ID (read-only)
 * ⚠️ DYNAMIC route — MUST be LAST
 */
router.get(
  "/:form4_id",
  verifyToken,
  Form4Controller.getForm4Details
);

export default router;
