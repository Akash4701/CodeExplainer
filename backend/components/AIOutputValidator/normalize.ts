export function normalize(text: string): string {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}
