import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";

import {
  getMasterZones,
  getCheckpointZones,
  getRuralDetails,
  submitForm1,
  getForm1List,
  getEditableForm1,
  editForm1,
} from "../Controllers/form1.Controller";

const router = Router();

router.get("/master-zones", verifyToken, getMasterZones);
router.post("/checkpoint-zones", verifyToken, getCheckpointZones);
router.post("/rural-details", verifyToken, getRuralDetails);
router.post("/submit", verifyToken, submitForm1);
router.get("/", verifyToken, getForm1List);
router.get("/editable", verifyToken, getEditableForm1);
router.put("/edit", verifyToken, editForm1);

export default router;
