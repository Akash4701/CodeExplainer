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

  validateNarration(parsed);
  return parsed;
}
