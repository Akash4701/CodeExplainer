// formatCode.controller.tsx
import { generateCodeNarration } from "../../components/generatePrompt.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Request, Response } from "express";

// ─── Supported languages (mirrors LANG_META keys in formatPrompt.ts) ──────────
const SUPPORTED_LANGUAGES = new Set([
  "python", "javascript", "typescript", "java", "go", "rust", "cpp",
  "csharp", "ruby", "php", "swift", "kotlin", "dart", "sql", "bash",
  "r", "scala", "lua",
]);

// ─── Basic code sanity checks ─────────────────────────────────────────────────
function validateCodeSnippet(code: unknown): asserts code is string {
  if (typeof code !== "string") {
    throw Object.assign(new Error("`codeSnippet` must be a string."), { status: 400 });
  }
  if (!code.trim()) {
    throw Object.assign(new Error("`codeSnippet` must not be empty."), { status: 400 });
  }
  if (code.length > 50_000) {
    throw Object.assign(
      new Error("`codeSnippet` exceeds the 50 000-character limit."),
      { status: 413 }
    );
  }
}

function validateLanguage(language: unknown): asserts language is string {
  if (typeof language !== "string") {
    throw Object.assign(new Error("`language` must be a string."), { status: 400 });
  }
  if (!language.trim()) {
    throw Object.assign(new Error("`language` must not be empty."), { status: 400 });
  }
  if (!SUPPORTED_LANGUAGES.has(language.trim().toLowerCase())) {
    throw Object.assign(
      new Error(
        `Unsupported language: "${language}". Supported: ${[...SUPPORTED_LANGUAGES].join(", ")}.`
      ),
      { status: 422 }
    );
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────
export const formatCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { codeSnippet, language, apiKey } = req.body;

    console.log("[formatCode] Received language :", language);
    console.log("[formatCode] Received snippet  :", codeSnippet?.slice?.(0, 120), "…");

    // ── 1. Input validation ──────────────────────────────────────────────────
    try {
      validateCodeSnippet(codeSnippet);
      validateLanguage(language);
    } catch (err: any) {
      res.status(err.status ?? 400).json({ error: err.message });
      return;
    }

    // ── 2. Call the model (format = true) ────────────────────────────────────
    let raw: string;
    try {
      raw = await generateCodeNarration(codeSnippet, language, true, apiKey);
    } catch (err: any) {
      console.error("[formatCode] Model call failed:", err);
      res.status(502).json({
        error: "Upstream model request failed.",
        details: err.message ?? "Unknown error",
      });
      return;
    }

    console.log("[formatCode] Raw model output (first 200 chars):", raw?.slice(0, 200));

    // ── 3. Guard: model returned nothing ────────────────────────────────────
    if (!raw?.trim()) {
      res.status(500).json({ error: "Model returned an empty response." });
      return;
    }

    // ── 4. Strip accidental markdown fences the model may sneak in ──────────
    //    The prompt already forbids them, but defensive stripping is cheap.
    const formattedCode = stripFences(raw);

    // ── 5. Sanity-check: formatted output should still contain code ──────────
    if (!formattedCode.trim()) {
      console.error("[formatCode] Output became empty after fence stripping. Raw:", raw);
      res.status(500).json({
        error: "Formatted output was empty after post-processing.",
        raw,
      });
      return;
    }

    // ── 6. Success ───────────────────────────────────────────────────────────
    res.status(200).json({ formattedCode });
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Removes leading/trailing markdown code fences that some models add
 * despite being told not to.
 *
 * Handles patterns like:
 *   ```python\n…\n```
 *   ```\n…\n```
 *   `…`
 */
function stripFences(raw: string): string {
  // Multi-line fences  (``` … ```)
  const fenceMatch = raw.match(/^```[\w]*\n?([\s\S]*?)```\s*$/);
  if (fenceMatch?.[1] !== undefined) return fenceMatch[1];

  // Single-line inline ticks  (`…`)
  const inlineMatch = raw.match(/^`([^`]+)`$/);
  if (inlineMatch?.[1] !== undefined) return inlineMatch[1];

  return raw;
}