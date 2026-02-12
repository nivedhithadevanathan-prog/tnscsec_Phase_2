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

/*FORM9 INIT*/
router.post(
  "/init", verifyToken,
  validate(initForm9Schema),
  Form9Controller.init
);

/*FORM9 PREVIEW*/
router.get(
  "/preview",
  validate(previewForm9Schema),
  Form9Controller.preview
);

/*FORM9 REJECT CANDIDATES*/
router.post(
  "/reject",
  verifyToken,
  validate(rejectForm9Schema),
  Form9Controller.reject
);


/*FORM9 WITHDRAW CANDIDATES*/
router.post(
  "/withdraw",
  validate(withdrawForm9Schema),
  Form9Controller.withdraw
);

/*FORM9 FINAL (PER SOCIETY)*/
router.post(
  "/final",
  validate(finalForm9Schema),
  Form9Controller.final
);

/*FORM9 LIST (WINNERS LIST)*/
router.get(
  "/list",
  Form9Controller.list
);

/*FORM9 SUBMIT*/
router.post(
  "/submit",
  validate(listForm9Schema),
  Form9Controller.submit
);

export default router;
