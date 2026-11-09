import { extractJson } from "./AIOutputValidator/extractJson.js";
import { normalize } from "./AIOutputValidator/normalize.js";
import { safeParse } from "./AIOutputValidator/safeParse.js";
import { validateNarration } from "./AIOutputValidator/validateNarration.js";

interface CodeRange {
  line_start: number;
  line_end: number;
}

interface FlowNode {
  id: string;
  type: "start" | "process" | "decision" | "end";
  title: string;
  description: string;
  code_ranges: CodeRange[];
  next: string[];
}

const FLOW_TYPES = ["start", "process", "decision", "end"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFlowType(value: unknown): value is FlowNode["type"] {
  return FLOW_TYPES.some((type) => type === value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === "string");
}

export function processGeminiOutput(raw: string, code: string) {
  const sanitized = normalize(raw);
  const jsonText = extractJson(sanitized);
  const parsed: unknown = safeParse(jsonText);

  if (!isRecord(parsed)) {
    throw new Error("Model output must be a JSON object");
  }

  if (typeof parsed.error === "string") {
    return { error: parsed.error };
  }

  if (!Array.isArray(parsed.flow_map) || parsed.flow_map.length === 0) {
    throw new Error("flow_map must contain at least one execution node");
  }

  const sourceLineCount = code.split("\n").length;
  const rawNodes: unknown[] = parsed.flow_map;
  const ids = new Set<string>();
  const nodes: FlowNode[] = rawNodes.map((candidate, index) => {
    if (!isRecord(candidate)) {
      throw new Error(`Invalid flow_map node at index ${index}`);
    }

    const { id, type, title, description, code_ranges, next } = candidate;
    if (
      typeof id !== "string" ||
      !id.trim() ||
      ids.has(id) ||
      !isFlowType(type) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !Array.isArray(code_ranges) ||
      code_ranges.length === 0 ||
      !isStringArray(next)
    ) {
      throw new Error(`Invalid flow_map node at index ${index}`);
    }

    ids.add(id);

    const ranges: CodeRange[] = code_ranges.map((value: unknown) => {
      if (!isRecord(value)) {
        throw new Error(`Invalid source range for flow node "${id}"`);
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
        throw new Error(`Invalid source range for flow node "${id}"`);
      }
      return { line_start, line_end };
    });

    const mergedRanges = ranges
      .sort((a, b) => a.line_start - b.line_start)
      .reduce<CodeRange[]>((result, range) => {
        const previous = result[result.length - 1];
        if (previous && range.line_start <= previous.line_end + 1) {
          previous.line_end = Math.max(previous.line_end, range.line_end);
        } else {
          result.push({ ...range });
        }
        return result;
      }, []);

    return {
      id,
      type,
      title: title.trim(),
      description: description.trim(),
      code_ranges: mergedRanges,
      next,
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    if (
      node.next.some((nextId) => typeof nextId !== "string" || !nodeIds.has(nextId)) ||
      new Set(node.next).size !== node.next.length
    ) {
      throw new Error(`Invalid next-node connection for flow node "${node.id}"`);
    }
  }

  const result = { flow_map: nodes };
  validateNarration(result, sourceLineCount);
  return result;
}
