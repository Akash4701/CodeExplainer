import { Router } from "express";
import { answerQuestion } from "../controller/question.controller.js";

const router = Router();

router.post("/answer-question", answerQuestion);

export default router;