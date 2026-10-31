import { extractJson } from "./AIOutputValidator/extractJson.js";
import { normalize } from "./AIOutputValidator/normalize.js";
import { safeParse } from "./AIOutputValidator/safeParse.js";
import { validateNarration } from "./AIOutputValidator/validateNarration.js";

export function processGeminiOutput(raw: string) {
  const sanitized = normalize(raw);
  const jsonText = extractJson(sanitized);
  const parsed = safeParse(jsonText);

  // Handle error response from prompt
  if (parsed.error) {
    return parsed;
  }

  if (Array.isArray(parsed.line_map)) {
    const lineGroups = new Map<number, { first: string; last: string; count: number }>();
    for (const item of parsed.line_map) {
      if (typeof item?.line !== "number" || typeof item?.text !== "string") continue;
      const existing = lineGroups.get(item.line);
      if (existing) {
        existing.last = item.text;
        existing.count += 1;
      } else {
        lineGroups.set(item.line, { first: item.text, last: item.text, count: 1 });
      }
    }

    parsed.line_map = Array.from(lineGroups, ([line, group]) => ({
      line,
      text: group.first === group.last
        ? group.first
        : `${group.first} ${group.last}`,
    })).slice(0, 12);
  }

  const narrationLines = new Set(
    Array.isArray(parsed.line_map)
      ? parsed.line_map.map((item: { line: number }) => item.line)
      : [],
  );

  if (Array.isArray(parsed.flow_map)) {
    const uniqueSteps = new Map<number, { line: number | number[]; type: string; title: string; description: string }>();
    for (const step of parsed.flow_map) {
      const lines = Array.isArray(step?.line) ? step.line : [step?.line];
      const validLines = lines.filter((line: unknown) => typeof line === "number" && narrationLines.has(line));
      if (validLines.length === 0) continue;

      const line = validLines.length === 1 ? validLines[0] : validLines;
      const key = validLines[0];
      if (!uniqueSteps.has(key)) {
        uniqueSteps.set(key, {
          ...step,
          line,
          type: ["start", "process", "decision", "end"].includes(step.type) ? step.type : "process",
          title: typeof step.title === "string" && step.title.trim() ? step.title : `Execution stage ${uniqueSteps.size + 1}`,
          description: typeof step.description === "string" ? step.description : "Follows this operation through execution",
        });
      }
    }

    parsed.flow_map = Array.from(uniqueSteps.values()).slice(0, 10).map((step) => {
      const words = step.description.trim().split(/\s+/).filter(Boolean);
      if (words.length > 6) {
        return { ...step, description: words.slice(0, 6).join(" ") };
      }

      if (words.length === 4) {
        return { ...step, description: `${words.join(" ")} here` };
      }
      if (words.length === 3) {
        return { ...step, description: `${words.join(" ")} in this execution` };
      }
      if (words.length === 2) {
        return { ...step, description: `${words.join(" ")} during this step` };
      }
      if (words.length === 1) {
        return { ...step, description: `${words.join(" ")} during this step now` };
      }
      if (words.length === 0) {
        return { ...step, description: "Follows this operation through execution" };
      }

      return step;
    });
  }

  if (!Array.isArray(parsed.flow_map) || parsed.flow_map.length === 0) {
    parsed.flow_map = parsed.line_map.slice(0, 10).map((item: { line: number }, index: number) => ({
      line: item.line,
      type: index === 0 ? "start" : "process",
      title: `Execution stage ${index + 1}`,
      description: "Follows this operation through execution",
    }));
  }

  validateNarration(parsed);
  return parsed;
}
