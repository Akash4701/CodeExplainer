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
}
