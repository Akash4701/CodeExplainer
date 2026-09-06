import { generateCodeNarration } from "../../components/generatePrompt.js";
import { processGeminiOutput } from "../../components/processOutput.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Request, Response } from "express";

export const explainCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { codeSnippet, language, apiKey } = req.body;

    console.log('Recieved code', codeSnippet);
    console.log('Recieved language', language);

    const explanation = await generateCodeNarration(codeSnippet, language, false, apiKey);

    let cleaned;
    try {
        cleaned = processGeminiOutput(explanation);

    } catch (error: any) {
        console.error("Error processing Gemini output:", error);
        res.status(500).json({
            error: "Model returned invalid output",
            details: error.message,
            raw: explanation
        });
        return;
    }
    console.log("Generated explanation:", cleaned);
    res.status(200).json({ explanation: cleaned });

});