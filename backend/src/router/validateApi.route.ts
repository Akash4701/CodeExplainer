import { Router } from "express";
import { validateApiKey } from "../controller/validateApi.controller.js";

const router = Router();

router.route("/validate-api-key").post(validateApiKey);

export default router;