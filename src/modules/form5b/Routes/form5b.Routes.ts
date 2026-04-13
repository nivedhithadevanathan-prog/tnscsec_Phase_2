import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form5BController } from "../../form5b/Controllers/form5b.controller";

const router = Router();

router.get("/preview",verifyToken,Form5BController.getPreview);

router.post("/stop-society",verifyToken,Form5BController.stopSociety);

router.post("/stop-candidates",verifyToken,Form5BController.stopCandidates);

router.post("/submit",verifyToken,Form5BController.submitForm5B);

router.get("/list",verifyToken,Form5BController.getForm5BList);

router.get("/editable",verifyToken,Form5BController.getEditableForm5B);

router.put("/edit",verifyToken,Form5BController.editForm5B);

router.get("/pdf", verifyToken, Form5BController.getForm5BPdf);

export default router;