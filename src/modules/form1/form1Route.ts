import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { Form1Controller } from "./form1Controller";

const router = Router();


router.get("/master-zones", verifyToken, Form1Controller.getMasterZones);


router.post("/checkpoint-zones", verifyToken, Form1Controller.getCheckpointZones);


router.post("/rural-details", verifyToken, Form1Controller.getRuralDetails);


router.post("/submit", verifyToken, Form1Controller.submitForm1);


router.get("/", verifyToken, Form1Controller.listForm1);


router.get("/editable", verifyToken, Form1Controller.getEditableForm1);


router.put("/edit", verifyToken, Form1Controller.editForm1);




router.get("/:id", verifyToken, Form1Controller.getSubmittedForm1);

export default router;
