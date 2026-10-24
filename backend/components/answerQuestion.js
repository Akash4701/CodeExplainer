import { getGeminiClient } from "./getGeminiClient.js";
export async function answerCodeQuestion(code, language, lineNumber, lineCode, existingExplanation, question) {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are a concise code tutor. Answer the user's question about the selected line.
Use the complete code and the existing explanation for context.
Return only a natural-language answer in 2 or 3 short sentences. Do not use markdown headings.

LANGUAGE: ${language}
SELECTED LINE ${lineNumber}: ${lineCode}
EXISTING LINE EXPLANATION: ${existingExplanation || "No explanation was generated for this line."}
USER QUESTION: ${question}

COMPLETE CODE:
${code}
`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}
//# sourceMappingURL=answerQuestion.js.map