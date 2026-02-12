import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { Form4Controller } from "../../form4/Controllers/form4.Controller";

const router = Router();

/*Load Form4 base data*/
router.get(
  "/",
  verifyToken,
  Form4Controller.loadForm4
);

/*Checkbox preview*/
router.post(
  "/checkbox",
  verifyToken,
  Form4Controller.checkboxUpdate
);

/*Submit Form4 (CREATE)*/
router.post(
  "/submit",
  verifyToken,
  Form4Controller.submitForm4
);

/*Edit Form4*/
router.put(
  "/",
  verifyToken,
  Form4Controller.editForm4
);

/*List all Form4*/
router.get(
  "/list",
  verifyToken,
  Form4Controller.getForm4List
);

/*Editable Form4*/
router.get(
  "/editable",
  verifyToken,
  Form4Controller.getEditableForm4
);

/*Get Form4 details by ID*/
router.get(
  "/:form4_id",
  verifyToken,
  Form4Controller.getForm4Details
);

export default router;
