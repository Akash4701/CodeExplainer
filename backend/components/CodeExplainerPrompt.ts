
export function buildCodeNarrationPrompt(code: string, language: string): string {
  const numberedCode = code
    .split("\n")
    .map((line, index) => `${String(index + 1).padStart(4, " ")} | ${line}`)
    .join("\n");

  return `
You are an expert software engineer who builds accurate and concise execution-flow maps.

Analyze the supplied source code and explain its meaningful control flow and data flow.

Your goal is to represent the COMPLETE execution flow in the MOST CONCISE way possible, without sacrificing important execution details.

Focus on:
- Entry points and execution initialization.
- Function and method calls.
- Conditions and alternative branches.
- Loops and repeated execution.
- Important data transformations.
- Return values and observable outputs.
- Program termination.

FLOW CONCISENESS AND COMPLETENESS:

- Make the execution flow as concise as possible while preserving all important execution stages.
- Avoid unnecessary nodes, redundant transitions and repetitive explanations.
- Merge related operations into a single meaningful stage wherever appropriate.
- Do not create a separate node for every source statement.
- Represent the complete meaningful execution flow from entry point to termination.
- Cover all relevant conditional branches, including true and false outcomes.
- Include loop continuation and loop exit paths.
- Include meaningful function calls, returns and observable outputs.
- Group repeated loop iterations and recursive calls rather than unrolling them.
- Do not omit important execution stages simply to reduce the node count.
- Prioritize clarity, completeness and readability over node count.

Return ONLY valid JSON in this EXACT format:

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

SOURCE MAPPING AND GRAPH RULES:

- Source line numbers are one-based and inclusive. Use only the numbered source lines shown below.
- Every node must have one or more precise code_ranges.
- A node may contain multiple non-contiguous code ranges. Do not include unrelated intervening lines.
- Map conditions to their condition expressions, loop nodes to their loop conditions, function calls to their call sites and relevant function bodies, and returns to their return statements.
- Merge adjacent statements serving the same purpose, but keep distinct decisions, branches, calls, loop transitions and returns identifiable.
- Generate as many nodes as necessary to represent the complete meaningful execution flow. There is no fixed node limit.
- Assign every node a unique ID.
- Keep nodes in a readable order, even when execution returns to an earlier node.

EXECUTION CONNECTION RULES:

- The "next" property must contain every possible immediate successor node ID.
- Decision nodes must connect to all relevant branch destinations.
- Loop-body paths must connect back to the loop decision, including the loop exit path.
- Function calls and returns must represent meaningful execution transfers when visible in the supplied source.
- Use an empty next array only for terminal nodes.
- Never reference unknown node IDs or invent execution transitions.
- Do not force independent execution paths into an artificial sequence.

NODE TYPE RULES:

- Use "start" for actual entry points.
- Use "decision" for conditions, branches and loop checks.
- Use "process" for meaningful operations.
- Use "end" for terminal returns, outputs or termination.

LANGUAGE-SPECIFIC RULES:

- Treat LANGUAGE as the syntax and semantics to analyze.
- Support JavaScript, TypeScript, Python, Java, C++, Apex Classes and Apex Triggers.
- Apex Classes and Apex Triggers share the same Apex language rules.
- For Apex Triggers, identify the trigger event, execution context and relevant handler calls.
- Understand asynchronous execution when applicable.

ACCURACY RULES:

- Follow actual program semantics rather than source-file order alone.
- Do not invent unreachable execution stages.
- Do not assume branch outcomes when they depend on runtime data.
- Distinguish known execution paths from runtime-dependent behavior.
- If multiple independent entry points exist, represent them appropriately.
- Do not include imports, braces, declarations or boilerplate unless they affect execution.
- Do not create a separate line_map. code_ranges are the sole source mapping.

VALIDATION:

- If code is empty or cannot be meaningfully analyzed, return:
{
  "error": "Invalid or empty code",
  "flow_map": []
}

- Ensure all JSON is valid.
- Ensure all code ranges reference actual source lines.
- Ensure every next reference points to an existing node ID.
- Return ONLY JSON without markdown, backticks or explanations.

LANGUAGE: ${language}

NUMBERED SOURCE (digits before | are authoritative line numbers):
${numberedCode}
`;
}
