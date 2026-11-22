import { Router } from "express";
import { submitFeedback } from "../controller/feedback.controller.js";
const router = Router();
router.post("/feedback", submitFeedback);
export default router;
//# sourceMappingURL=feedback.route.js.map