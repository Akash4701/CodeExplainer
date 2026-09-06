import type { Request, Response } from "express";
import { getGeminiClient } from "../../components/getGeminiClient.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const VALIDATION_PROMPT = "Respond with OK only.";

export const validateApiKey = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const apiKey = typeof req.body?.apiKey === "string" ? req.body.apiKey : undefined;

        try {
            const client = getGeminiClient(apiKey);
            const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
            await model.generateContent(VALIDATION_PROMPT);

            res.status(200).json({
                success: true,
                message: "Gemini API key is valid and available.",
                data: { valid: true },
            });
        } catch (error: unknown) {
            const details = getErrorDetails(error);
            const response = getValidationErrorResponse(details);

            console.error("[validateApiKey] Gemini validation failed:", details.message);
            res.status(response.statusCode).json({
                success: false,
                error: response.error,
                details: details.message,
                data: { valid: false },
            });
        }
    }
);

type ErrorDetails = { message: string; status?: number | undefined; code?: string | undefined };

function getErrorDetails(error: unknown): ErrorDetails {
    if (error instanceof Error) {
        const candidate = error as Error & { status?: number; statusCode?: number; code?: string };
        return {
            message: error.message || "Unknown Gemini error.",
            status: candidate.status ?? candidate.statusCode,
            code: candidate.code,
        };
    }

    return { message: "Unknown Gemini error." };
}

function getValidationErrorResponse(details: ErrorDetails) {
    const normalizedMessage = details.message.toLowerCase();
    const isMissingKey = normalizedMessage === "gemini api key is missing";
    const isQuotaError = details.status === 429 ||
        details.code === "429" ||
        /quota|rate.?limit|resource exhausted|too many requests|limit exceeded/.test(normalizedMessage);
    const isInvalidKey = details.status === 401 ||
        details.status === 403 ||
        /api key not valid|invalid api key|unauthorized|permission denied|authentication/.test(normalizedMessage);

    if (isMissingKey) {
        return { statusCode: 500, error: "Gemini API key is not configured." };
    }

    if (isQuotaError) {
        return { statusCode: 429, error: "Gemini API key quota or rate limit has been exceeded." };
    }

    if (isInvalidKey) {
        return { statusCode: 401, error: "Gemini API key is invalid or unauthorized." };
    }

    return { statusCode: details.status && details.status >= 500 ? 503 : 502, error: "Gemini API validation failed." };
}
