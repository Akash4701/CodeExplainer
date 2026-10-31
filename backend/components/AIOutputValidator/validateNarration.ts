export function validateNarration(data: any) {
  if (!data || typeof data !== "object" || !Array.isArray(data.line_map)) {
    throw new Error("line_map must be array");
  }

  for (const item of data.line_map) {
    if (
      typeof item.line !== "number" ||
      !Number.isInteger(item.line) ||
      item.line < 1 ||
      typeof item.text !== "string" ||
      !item.text.trim()
    ) {
      throw new Error("Invalid line_map entry");
    }
  }

  if (data.flow_map !== undefined) {
    if (!Array.isArray(data.flow_map)) {
      throw new Error("flow_map must be an array");
    }

    const flowTypes = new Set(["start", "process", "decision", "end"]);
    const narrationLines = new Set(data.line_map.map((item: { line: number }) => item.line));
    for (const step of data.flow_map) {
      const wordCount = typeof step?.description === "string"
        ? step.description.trim().split(/\s+/).filter(Boolean).length
        : 0;
      const stepLines = Array.isArray(step?.line) ? step.line : [step?.line];

      if (
        !step ||
        typeof step !== "object" ||
        stepLines.length === 0 ||
        stepLines.some((line: unknown) => typeof line !== "number" || !narrationLines.has(line)) ||
        !flowTypes.has(step.type) ||
        typeof step.title !== "string" ||
        !step.title.trim() ||
        typeof step.description !== "string" ||
        wordCount < 5 ||
        wordCount > 6
      ) {
        throw new Error("Invalid flow_map entry");
      }
    }
  }
}
