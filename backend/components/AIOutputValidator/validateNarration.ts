export function validateNarration(data: any) {
  if (typeof data.narration !== "string") {
    throw new Error("Invalid narration");
  }

  if (!Array.isArray(data.line_map)) {
    throw new Error("line_map must be array");
  }

  for (const item of data.line_map) {
    if (
      typeof item.line !== "number" ||
      typeof item.text !== "string"
    ) {
      throw new Error("Invalid line_map entry");
    }
  }
}
