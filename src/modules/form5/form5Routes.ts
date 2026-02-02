import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { Form5Controller } from "./form5Controller";

const router = Router();

router.get("/eligible", verifyToken, Form5Controller.getEligibleForm5);
router.post("/submit", verifyToken, Form5Controller.submitForm5);
router.get("/", verifyToken, Form5Controller.listForm5);

router.get("/editable", verifyToken, Form5Controller.getEditableForm5);
router.put("/edit", verifyToken, Form5Controller.editForm5);

export default router;
