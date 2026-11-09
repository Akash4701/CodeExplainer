interface FlowNode {
  id: string;
  type: "start" | "process" | "decision" | "end";
  title: string;
  description: string;
  code_ranges: { line_start: number; line_end: number }[];
  next: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateNarration(
  data: unknown,
  sourceLineCount: number,
): asserts data is { flow_map: FlowNode[] } {
  if (!isRecord(data) || !Array.isArray(data.flow_map) || data.flow_map.length === 0) {
    throw new Error("flow_map must contain at least one execution node");
  }

  const flowTypes = new Set(["start", "process", "decision", "end"]);
  const flowMap: unknown[] = data.flow_map;
  const ids = new Set<string>();
  for (const candidate of flowMap) {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      !candidate.id.trim() ||
      ids.has(candidate.id) ||
      typeof candidate.type !== "string" ||
      !flowTypes.has(candidate.type) ||
      typeof candidate.title !== "string" ||
      !candidate.title.trim() ||
      typeof candidate.description !== "string" ||
      !candidate.description.trim() ||
      !Array.isArray(candidate.code_ranges) ||
      candidate.code_ranges.length === 0 ||
      !Array.isArray(candidate.next)
    ) {
      throw new Error("Invalid flow_map entry");
    }
    ids.add(candidate.id);

    for (const value of candidate.code_ranges) {
      if (!isRecord(value)) {
        throw new Error("Invalid flow_map source range");
      }
      const { line_start, line_end } = value;
      if (
        typeof line_start !== "number" ||
        typeof line_end !== "number" ||
        !Number.isInteger(line_start) ||
        !Number.isInteger(line_end) ||
        line_start < 1 ||
        line_end < line_start ||
        line_end > sourceLineCount
      ) {
        throw new Error("Invalid flow_map source range");
      }
    }
  }

  for (const candidate of flowMap) {
    if (!isRecord(candidate) || !Array.isArray(candidate.next)) {
      throw new Error("Invalid flow_map connection");
    }
    if (candidate.next.some((id: unknown) => typeof id !== "string" || !ids.has(id))) {
      throw new Error("Invalid flow_map connection");
    }
  }
}
