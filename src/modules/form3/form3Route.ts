import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import {
  getForm3ListController,
  submitForm3Controller,
  listForm3Controller,
  getSubmittedForm3Controller,
  getEditableForm3Controller,
  editForm3Controller,
} from "./form3Controller";

const router = Router();

router.get("/form2-list", verifyToken, getForm3ListController);
router.post("/submit", verifyToken, submitForm3Controller);


router.get("/", verifyToken, listForm3Controller);


router.get("/editable", verifyToken, getEditableForm3Controller);


router.put("/edit", verifyToken, editForm3Controller);


router.get("/:form3_id", verifyToken, getSubmittedForm3Controller);

export default router;
