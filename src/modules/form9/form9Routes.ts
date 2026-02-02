import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { Form9Controller } from "./form9Controller";

const router = Router();

router.post("/init", verifyToken, Form9Controller.init);
router.get("/preview", verifyToken, Form9Controller.getPreview);


router.post("/reject", verifyToken, Form9Controller.reject);
router.post("/withdraw", verifyToken, Form9Controller.withdraw);
router.post("/society-finalize", verifyToken, Form9Controller.finalize);
router.post("/submit", verifyToken, Form9Controller.submit);
router.get("/list", verifyToken, Form9Controller.list);


export default router;
