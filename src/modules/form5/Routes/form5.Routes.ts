import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form5Controller } from "../../form5/Controllers/form5.Controller";

const router = Router();

/*GET Eligible societies for Form5*/
router.get(
  "/eligible",
  verifyToken,
  Form5Controller.getEligibleSocieties
);

/*POST Submit Form5*/
router.post(
  "/submit",
  verifyToken,
  Form5Controller.submitForm5
);

/*GET Form5 list*/
router.get(
  "/list",
  verifyToken,
  Form5Controller.getForm5List
);

/*GET Editable Form5*/
router.get(
  "/editable",
  verifyToken,
  Form5Controller.getEditableForm5
);

/*PUT Edit Form5*/
router.put(
  "/edit",
  verifyToken,
  Form5Controller.editForm5
);

export default router;
