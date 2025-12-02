
import { GoogleGenerativeAI } from '@google/generative-ai'
;

// Builds the full code-narration prompt
function buildCodeNarrationPrompt(code: string, language: string): string {
  return `
You are an expert code narrator and senior-level software engineer.
Your job is to understand the code deeply and explain it with maximum clarity, accuracy, and insight.

Your goal is to produce:
1. "narration" → a rich, intuitive, high-quality explanation of what the code does, how it works, why each part exists, and how the logic flows from start to end.
   - It should feel like a helpful senior engineer walking someone through the code.
   - Use simple, clear language.
   - Highlight important conditions, loops, function behavior, and data transformations.

2. "line_map" → a list of objects where each element maps:
   - "line": the exact line number
   - "text": a concise 1–2 sentence explanation of what that line is doing

The output MUST be returned as a valid JSON object in EXACTLY this format:

{
  "narration": "Full, high-quality explanation...",
  "line_map": [
    { "line": number, "text": "description" }
  ]
}

STRICT RULES:
- Output ONLY the JSON. No extra text.
- DO NOT repeat or restate the code.
- DO NOT add comments outside JSON.
- Maintain accurate line numbers exactly as in the provided code.
- Explanations must be correct, precise, and helpful.
- If multiple lines serve one purpose, still produce an entry for each line.
- If the code is empty or invalid, return:
  { "error": "Invalid or empty code" }

Here is the code. Use this exact formatting and line structure.

LANGUAGE: ${language}

CODE:
${code}
`;
}

// Main function that accepts code and language as parameters
export async function generateCodeNarration(
  code: string,
  language: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });

  const finalPrompt = buildCodeNarrationPrompt(code, language);

  const result = await model.generateContentStream(finalPrompt);

  let fullResponse = "";

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
  }

  return fullResponse;
}

// Alternative: Return as a stream for real-time processing
export async function* generateCodeNarrationStream(
  code: string,
  language: string
): AsyncGenerator<string, void, unknown> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
  });

  const finalPrompt = buildCodeNarrationPrompt(code, language);

  const result = await model.generateContentStream(finalPrompt);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

// Example usage (can be removed in production)
async function main() {
  const inputCode = `
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Fibonacci of 10:", result);
`;
  const inputLanguage = "typescript";

  // Using the full response version
  const narration = await generateCodeNarration(inputCode, inputLanguage);
  console.log(narration);

  // Or using the stream version
  // console.log("Streaming response:");
  // for await (const chunk of generateCodeNarrationStream(inputCode, inputLanguage)) {
  //   process.stdout.write(chunk);
  // }
}

// Only run if this file is executed directly
