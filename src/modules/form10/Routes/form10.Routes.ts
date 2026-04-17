import { Router } from "express";
import { Form10Controller } from "../../form10/Controllers/form10.Controller";
import { validate } from "../../../middleware/validate.middleware";
import { verifyToken } from "../../../middleware/auth.middleware";
import { initForm10Schema } from "../Validations/form10.Schema";
import { previewForm10Schema } from "../Validations/form10.Schema";
import { rejectForm10Schema } from "../Validations/form10.Schema";
import { withdrawForm10Schema } from "../Validations/form10.Schema";
import { finalForm10Schema } from "../Validations/form10.Schema";
import { submitForm10Schema } from "../Validations/form10.Schema";





const router = Router();

/*FORM10 INIT*/
router.post("/init",verifyToken,validate(initForm10Schema),Form10Controller.init);

/*FORM10 PREVIEW*/
router.get("/preview",verifyToken,validate(previewForm10Schema),Form10Controller.preview);

router.post("/reject",verifyToken,validate(rejectForm10Schema),Form10Controller.reject);

router.post("/withdraw",verifyToken,validate(withdrawForm10Schema),Form10Controller.withdraw);

router.post("/final",verifyToken,validate(finalForm10Schema),Form10Controller.final);

router.post("/submit",verifyToken,validate(submitForm10Schema),Form10Controller.submit);

router.get("/list",verifyToken,Form10Controller.list);

router.get("/pdf", verifyToken, Form10Controller.getForm10Pdf);

export default router;

