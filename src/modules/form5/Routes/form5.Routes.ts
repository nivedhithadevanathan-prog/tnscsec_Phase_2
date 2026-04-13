import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form5Controller } from "../../form5/Controllers/form5.Controller";

const router = Router();

router.get("/eligible",verifyToken,Form5Controller.getEligibleSocieties);

router.post("/submit",verifyToken,Form5Controller.submitForm5);

router.get("/list",verifyToken,Form5Controller.getForm5List);

router.get("/editable",verifyToken,Form5Controller.getEditableForm5);

router.put("/edit",verifyToken,Form5Controller.editForm5);

router.get("/pdf", verifyToken, Form5Controller.getForm5Pdf);

export default router;
