import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form8Controller } from "../../form8/Controllers/form8.Controller";

const router = Router();

/**
 * =====================================================
 * Form8 – Preview (Vote Counting)
 * =====================================================
 * Purpose:
 * - Show polled societies
 * - Show stopped elections
 * - Show rural + declared counts
 *
 * READ ONLY
 */
router.get(
  "/preview",
  verifyToken,
  Form8Controller.previewForm8
);

/**
 * =====================================================
 * Form8 – Checkbox Preview
 * =====================================================
 * Purpose:
 * - Auto-select winners based on seat limits
 * - Show selected & rejected members
 *
 * READ ONLY
 */
router.get(
  "/checkbox-preview",
  verifyToken,
  Form8Controller.checkboxPreview
);

/**
 * =====================================================
 * Form8 – Save Final Result (Winners)
 * =====================================================
 * Purpose:
 * - Save winning members per society
 * - Supports:
 *   SC_ST / WOMEN / GENERAL
 *   SC_ST_DLG / WOMEN_DLG / GENERAL_DLG
 *
 * WRITE
 */
router.post(
  "/final-result",
  verifyToken,
  Form8Controller.saveFinalResult
);

/**
 * =====================================================
 * Form8 – Submit
 * =====================================================
 * Purpose:
 * - Save polling details
 * - Validate final result exists
 * - Logical submit
 *
 * WRITE
 */
router.post(
  "/submit",
  verifyToken,
  Form8Controller.submitForm8
);

/**
 * =====================================================
 * Form8 – List (Submitted Data)
 * =====================================================
 * Purpose:
 * - Fetch all submitted Form8 data
 * - Group by Form8 → Society → Category → Winners
 *
 * READ ONLY
 */
router.get(
  "/list",
  verifyToken,
  Form8Controller.listForm8
);

export default router;
