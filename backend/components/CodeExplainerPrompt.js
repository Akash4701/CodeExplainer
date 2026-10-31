export function buildCodeNarrationPrompt(code, language) {
    // Number every line explicitly — model sees "1 | const x = 1"
    // so it cannot miscount blank lines or leading newlines
    const numberedCode = code
        .split("\n")
        .map((line, i) => `${String(i + 1).padStart(4, " ")} | ${line}`)
        .join("\n");
    return `
You are an expert software engineer and code execution narrator.

Your task is NOT to explain the code line-by-line.
Your task is to explain the code's overall control flow and data flow.
Describe the important stages and how execution moves between them.
Do NOT simulate every runtime instruction or every recursive call.

Think in terms of:
- entry point
- function calls
- condition checks
- loops and iterations
- data changes
- return values

Produce a concise walkthrough of the meaningful execution path.
Jump between source lines when control flow jumps.
Group repeated loop iterations and recursive calls into one stage.

Return the result STRICTLY as valid JSON in this EXACT format:

{
  "line_map": [
    {
      "line": number,
      "text": "Why this line is important in the execution flow"
    }
  ],
  "flow_map": [
    {
      "line": number,
      "type": "start | process | decision | end",
      "title": "Short step title",
      "description": "A concise five or six word explanation."
    }
  ]
}

Rules:
- The narration must follow execution order, NOT file order.
- The narration should explain how values and control move, not syntax.
- Summarize the algorithm or process as a few meaningful stages.
- Do not narrate every line or every runtime repetition.
- Keep line_map to at most 12 entries; each entry is one distinct source line used in the path.
- If a source line runs repeatedly, describe its overall role once rather than tracing each call or iteration.
- The line_map must use the LINE NUMBERS shown in the numbered code below (the digits before the | pipe).
- The line_map should include ONLY key transitions that affect control flow or data.
- The flow_map is a concise diagram of the code's conceptual path, not a second narration.
- Include at most 10 flow_map nodes, ordered by execution path, and use line numbers that appear in line_map.
- A node may represent multiple source lines; include all relevant lines in its line field as an array.
- Include the entry point, important decisions, meaningful operations, and return/output.
- For loops and recursion, show the repeated transition once and label it as repeated; do not unroll iterations.
- Use "decision" for conditions, loop checks, and branches; use "start" for the actual entry point; use "end" for returns or termination; otherwise use "process".
- Each flow_map title should be short and clear.
- Each flow_map description must contain exactly five or six words and summarize what that step does.
- Do NOT include trivial lines (imports, braces, boilerplate) unless they affect execution.
- Line numbers may jump when control moves between functions or branches.
- Output ONLY the JSON — no markdown, no backticks, no explanation.
- If code is invalid or empty, return: { "error": "Invalid or empty code", "line_map": [], "flow_map": [] }

INPUT DETAILS:                                                                        
LANGUAGE: ${language}
CODE (line numbers are authoritative — use them exactly in line_map):
${numberedCode}
`;
}
//# sourceMappingURL=CodeExplainerPrompt.js.map