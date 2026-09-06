import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient(apiKey?: string): GoogleGenerativeAI {
  const key = apiKey?.trim() || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Gemini API key is missing");
  }

  return new GoogleGenerativeAI(key);
}