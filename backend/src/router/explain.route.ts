import { Router } from "express";
import { explainCode } from "../controller/explainer.controller.js";
import { formatCode } from "../controller/formatter.controller.js";

const router = Router();

router.route("/explain").post(explainCode);
router.route("/format-code").post(formatCode);

export default router;