export function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON");
  }
}
