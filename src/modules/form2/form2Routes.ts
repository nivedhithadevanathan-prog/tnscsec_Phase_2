import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import {
  getForm1SelectedController,
  checkboxForm2Controller,
  submitForm2Controller,
  getSubmittedForm2Controller,
  listForm2Controller,
  getEditableForm2Controller,
  editForm2Controller,
} from "./form2Controller";

const router = express.Router();


router.get("/form1-selected", verifyToken, getForm1SelectedController);


router.post("/checkbox", verifyToken, checkboxForm2Controller);


router.post("/submit", verifyToken, submitForm2Controller);


router.get("/submitted", verifyToken, getSubmittedForm2Controller);


router.get("/", verifyToken, listForm2Controller);


router.get("/editable", verifyToken, getEditableForm2Controller);


router.put("/edit", verifyToken, editForm2Controller);


export default router;
