import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form5BController } from "../../form5b/Controllers/form5b.controller";

const router = Router();

/*GET Form5B Preview*/
router.get(
  "/preview",
  verifyToken,
  Form5BController.getPreview
);

/*POST Stop Societies*/
router.post(
  "/stop-society",
  verifyToken,
  Form5BController.stopSociety
);

router.post(
  "/stop-candidates",
  verifyToken,
  Form5BController.stopCandidates
);

router.post(
  "/submit",
  verifyToken,
  Form5BController.submitForm5B
);

/*GET Form5B List*/
router.get(
  "/list",
  verifyToken,
  Form5BController.getForm5BList
);

export default router;