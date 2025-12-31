export function buildCodeNarrationPrompt(code: string, language: string): string {
  return `
You are an expert software engineer and code execution narrator.

Your task is NOT to explain the code line-by-line.
Your task is to explain how the code EXECUTES at runtime.

Think in terms of:
- entry point
- function calls
- condition checks
- loops and iterations
- data changes
- return values

Produce a narration that follows the ACTUAL execution flow,
even if it jumps between non-consecutive lines.

Return the result STRICTLY as valid JSON in this EXACT format:

{
  "narration": "A clear, story-like explanation of how the program runs from start to finish, describing the execution flow step-by-step.",
  "line_map": [
    {
      "line": number,
      "text": "Why this line is important in the execution flow"
    }
  ]
}

Rules:
- The narration must follow execution order, NOT file order.
- The narration should explain WHAT happens and WHY, not syntax.
- The narration should feel like walking through a debugger.
- The line_map should include ONLY meaningful lines that affect control flow or state.
- Do NOT include trivial lines (imports, braces, boilerplate) unless they affect execution.
- Line numbers may appear out of order if execution jumps (loops, conditions).
- Output ONLY the JSON.
- If code is invalid or empty, return: { "error": "Invalid or empty code" }

Here is the code (preserve formatting and line structure):
INPUT DETAILS:
LANGUAGE: ${language}

CODE:
${code}
`;
}
