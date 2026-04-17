import { Router } from "express";
import { Form9Controller } from "../../form9/Controllers/form9.Controller";
import { validate } from "../../../middleware/validate.middleware";
import {
  initForm9Schema,
  previewForm9Schema,
  rejectForm9Schema,
  withdrawForm9Schema,
  finalForm9Schema,
  listForm9Schema,
} from "../Validations/form9.Schema";
import { verifyToken } from "../../../middleware/auth.middleware";

const router = Router();

router.post("/init", verifyToken,validate(initForm9Schema),Form9Controller.init);

router.get("/preview",validate(previewForm9Schema),Form9Controller.preview);

router.post("/reject",verifyToken,validate(rejectForm9Schema),Form9Controller.reject);

router.post("/withdraw",validate(withdrawForm9Schema),Form9Controller.withdraw);

router.post("/final",validate(finalForm9Schema),Form9Controller.final);

router.get("/list",Form9Controller.list);

router.post("/submit",validate(listForm9Schema),Form9Controller.submit);

router.get("/pdf", verifyToken, Form9Controller.getForm9Pdf);

export default router;
