import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { Form7Controller } from "../../form7/Controllers/form7.Controller";

import {
  previewForm7Validation,
  submitForm7Validation,
  editForm7Validation,
  listForm7Validation,
  editableForm7Validation,
} from "../../form7/Validations/form7.Schema";


const router = Router();

/*GET Form7 Preview*/
router.get(
  "/preview",
  verifyToken,
  validate(previewForm7Validation),
  Form7Controller.preview
);

/*POST Submit Form7*/
router.post(
  "/submit",
  verifyToken,
  validate(submitForm7Validation),
  Form7Controller.submit
);

/*GET Form7 List*/
router.get(
  "/list",
  verifyToken,
  validate(listForm7Validation),
  Form7Controller.list
);

/*GET Editable Form7*/
router.get(
  "/editable",
  verifyToken,
  validate(editableForm7Validation),
  Form7Controller.editable
);

/*PUT Edit Form7*/
router.put(
  "/edit",
  verifyToken,
  validate(editForm7Validation),
  Form7Controller.edit
);

export default router;
