import { generateCodeNarration } from "../../components/generatePrompt.js";
import { processGeminiOutput } from "../../components/processOutput.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { normalizeModelError } from "../utils/modelError.js";
import type { Request, Response } from "express";

export const explainCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { codeSnippet, language } = req.body;

    console.log('Recieved code', codeSnippet);
    console.log('Recieved language', language);

    let explanation: string;
    try {
        explanation = await generateCodeNarration(codeSnippet, language);
    } catch (error: unknown) {
        const userError = normalizeModelError(error);
        console.error("[explainCode] Model call failed:", userError.details);
        res.status(userError.status).json(userError);
        return;
    }

    let cleaned;
    try {
        cleaned = processGeminiOutput(explanation, codeSnippet);

    } catch (error: any) {
        console.error("Error processing Gemini output:", error);
        res.status(500).json({
            error: "Model returned invalid output",
            details: error.message,
            raw: explanation
        });
        return;
    }
    if ("error" in cleaned) {
        res.status(422).json({ error: cleaned.error });
        return;
    }
    console.log("Generated explanation:", cleaned);
    res.status(200).json({ explanation: cleaned });

});