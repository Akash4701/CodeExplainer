import { Router } from "express";

import { formatCode } from "../controller/formatter.controller.js";

const router = Router();


router.route("/format-code").post(formatCode);

export default router;