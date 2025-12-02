import { Router } from "express";
import { explainCode } from "../controller/explainer.controller.js";

const router = Router();

router.route("/explain").post(explainCode);

export default router;