
import { GoogleGenerativeAI } from '@google/generative-ai'
;
import { buildCodeNarrationPrompt } from './CodeExplainerPrompt.js';

export async function generateCodeNarration(
  code: string,
  language: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const finalPrompt = buildCodeNarrationPrompt(code, language);

  const result = await model.generateContent(finalPrompt);

  

let fullResponse = result.response.text();

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
