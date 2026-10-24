import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured in the backend environment.");
  }

  return new GoogleGenerativeAI(key);
}