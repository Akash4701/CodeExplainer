import type { Request, Response } from "express";
import { answerCodeQuestion } from "../../components/answerQuestion.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { normalizeModelError } from "../utils/modelError.js";

export const answerQuestion = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { code, language, lineNumber, lineCode, existingExplanation, question } = req.body;

    if (
      typeof code !== "string" ||
      typeof language !== "string" ||
      typeof lineNumber !== "number" ||
      typeof lineCode !== "string" ||
      typeof question !== "string" ||
      !code.trim() ||
      !lineCode.trim() ||
      !question.trim()
    ) {
      res.status(400).json({ error: "Code, selected line, and question are required." });
      return;
    }

    try {
      const answer = await answerCodeQuestion(
        code,
        language,
        lineNumber,
        lineCode,
        typeof existingExplanation === "string" ? existingExplanation : "",
        question,
      );

      res.status(200).json({ answer });
    } catch (error: unknown) {
      const userError = normalizeModelError(error);
      console.error("[answerQuestion] Model call failed:", userError.details);
      res.status(userError.status).json(userError);
    }
  },
);