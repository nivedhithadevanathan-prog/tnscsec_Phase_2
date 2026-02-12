import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form8Controller } from "../../form8/Controllers/form8.Controller";

const router = Router();

/*Form8 Preview*/
router.get(
  "/preview",
  verifyToken,
  Form8Controller.previewForm8
);

/*Form8 Checkbox Preview*/
router.get(
  "/checkbox-preview",
  verifyToken,
  Form8Controller.checkboxPreview
);

/*Form8 Save Final Result (Winners)*/
router.post(
  "/final-result",
  verifyToken,
  Form8Controller.saveFinalResult
);

/*Form8 Submit*/
router.post(
  "/submit",
  verifyToken,
  Form8Controller.submitForm8
);

/*Form8 List (Submitted Data)*/
router.get(
  "/list",
  verifyToken,
  Form8Controller.listForm8
);

export default router;
