import { GoogleGenerativeAI } from "@google/generative-ai";
export function getGeminiClient(apiKey) {
    const key = apiKey?.trim();
    if (!key) {
        throw new Error("Gemini API key is missing");
    }
    return new GoogleGenerativeAI(key);
}
//# sourceMappingURL=getGeminiClient.js.map