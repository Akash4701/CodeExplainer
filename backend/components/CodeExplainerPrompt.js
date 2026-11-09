export function buildCodeNarrationPrompt(code, language) {
    const numberedCode = code
        .split("\n")
        .map((line, index) => `${String(index + 1).padStart(4, " ")} | ${line}`)
        .join("\n");
    return `
You are an expert software engineer who builds accurate execution-flow maps.

Analyze the supplied source code and describe its meaningful control flow and data flow. Follow actual program semantics, including the entry point, function/method calls, returns, conditions, both conditional outcomes, loops, and observable outputs. Group repeated iterations and recursive calls rather than unrolling them. Do not invent unreachable stages.

Return ONLY valid JSON in this format:
{
  "flow_map": [
    {
      "id": "unique stable identifier",
      "type": "start | process | decision | end",
      "title": "Short stage title",
      "description": "A concise explanation of this stage.",
      "code_ranges": [
        { "line_start": 1, "line_end": 2 }
      ],
      "next": ["id-of-next-node"]
    }
  ]
}

Source mapping and graph rules:
- Source line numbers are one-based and inclusive. Use only the numbered source lines shown below.
- Every node must have one or more precise code_ranges. A node may have multiple non-contiguous ranges; use separate range objects and do not include unrelated intervening lines.
- Map conditions to their condition expression, loop nodes to the loop condition, calls to the call site and/or relevant function body, and returns to their return statement.
- Create a node for each meaningful execution stage, not for each source line. Merge adjacent statements that serve one purpose, but keep distinct decisions, branches, calls, loop transitions, and returns as separate stages. Include important stages regardless of total count; there is no fixed node limit.
- Assign each node a unique id. Keep nodes in a readable topological/source order, even when execution returns to an earlier node.
- "next" must list every possible immediate successor node ID, not merely the next item in the array. Decision nodes must include successors for all branches (including loop exit); loop-body paths must connect back to the loop decision. Function-call and return edges must represent transfer into and back out of the called function when visible in this source.
- Use an empty next array only for terminal nodes. Do not point to unknown IDs.
- Use "start" for an entry stage, "decision" for branch/loop checks, "end" for terminal return/output/termination, and "process" otherwise.
- Treat LANGUAGE as the syntax and semantics to analyze. Supported inputs include JavaScript, TypeScript, Python, Java, C++, Apex classes, and Apex Triggers. Apex Classes and Apex Triggers use the same Apex language rules; a trigger's event and handler invocation form its entry flow.
- Do not create a separate line_map. code_ranges on flow nodes are the sole source mapping.
- Do not include imports, braces, declarations, or boilerplate unless they affect execution.
- If code is invalid or empty, return exactly: { "error": "Invalid or empty code", "flow_map": [] }

LANGUAGE: ${language}
NUMBERED SOURCE (digits before | are authoritative line numbers):
${numberedCode}
`;
}
//# sourceMappingURL=CodeExplainerPrompt.js.map