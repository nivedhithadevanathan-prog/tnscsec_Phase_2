import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form8Controller } from "../../form8/Controllers/form8.Controller";

const router = Router();

router.get("/preview",verifyToken,Form8Controller.previewForm8);

router.get("/checkbox-preview",verifyToken,Form8Controller.checkboxPreview);

router.post("/final-result",verifyToken,Form8Controller.saveFinalResult);

router.post("/submit",verifyToken,Form8Controller.submitForm8);

router.get("/list",verifyToken,Form8Controller.listForm8);

export default router;
