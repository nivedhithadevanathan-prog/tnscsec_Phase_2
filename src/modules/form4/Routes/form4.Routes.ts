import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form4Controller } from "../../form4/Controllers/form4.Controller";

const router = Router();

router.get("/",verifyToken,Form4Controller.loadForm4);

router.post("/checkbox",verifyToken,Form4Controller.checkboxUpdate);

router.post("/submit",verifyToken,Form4Controller.submitForm4);

router.put("/",verifyToken,Form4Controller.editForm4);

router.get("/list",verifyToken,Form4Controller.getForm4List);

router.get("/editable",verifyToken,Form4Controller.getEditableForm4);

router.get("/pdf", verifyToken, Form4Controller.getForm4Pdf);

router.get("/:form4_id",verifyToken,Form4Controller.getForm4Details);


export default router;
