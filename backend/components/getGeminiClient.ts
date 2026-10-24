import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient(apiKey?: string): GoogleGenerativeAI {
  const key = apiKey?.trim();

  if (!key) {
    throw new Error("Gemini API key is missing");
  }

  return new GoogleGenerativeAI(key);
}