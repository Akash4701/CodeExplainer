import type { Request, Response } from "express";
import { answerCodeQuestion } from "../../components/answerQuestion.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const answerQuestion = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { code, language, lineNumber, lineCode, existingExplanation, question, apiKey } = req.body;

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
        typeof apiKey === "string" ? apiKey : undefined,
      );

      res.status(200).json({ answer });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to answer the question.";
      console.error("[answerQuestion] Model call failed:", message);
      res.status(502).json({ error: "Unable to answer the question.", details: message });
    }
  },
);