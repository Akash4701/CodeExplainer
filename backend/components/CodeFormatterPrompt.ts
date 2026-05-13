// formatPrompt.ts
// ─────────────────────────────────────────────────────────────────────────────
// Builds the best possible prompt to send to any LLM (Gemini, Claude, GPT, etc.)
// to format source code for a given language.
//
// Usage:
//   import { buildFormatCodePrompt } from "./formatPrompt";
//
//   const prompt = buildFormatCodePrompt({
//     language: "python",
//     code: "def foo(x):return x*2",
//   });
//
//   // Then send `prompt` to your model as the user message.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuoteStyle = "single" | "double" | "auto";
export type IndentStyle = "space" | "tab";

export interface FormatCodeOptions {
  /** The programming language of the code (e.g. "python", "java", "go"). */
  language: string;

  /** The raw / messy code to format. */
  code: string;

  /** Number of spaces per indent level. Ignored if indentStyle is "tab". Default: 2 */
  tabSize?: number;

  /** Whether to use spaces or tabs. Default: "space" */
  indentStyle?: IndentStyle;

  /** Preferred quote style. Default: "auto" (follows language convention) */
  quoteStyle?: QuoteStyle;

  /** Max line length before wrapping. Default: 80 */
  printWidth?: number;

  /**
   * Whether to strip blank lines before returning the formatted code.
   * Useful when piping output into a line-by-line explainer model.
   * Default: false
   */
  stripBlankLines?: boolean;
}

// ─── Language style guides ────────────────────────────────────────────────────
// Each entry documents the canonical formatter + style conventions for the
// language so the LLM knows exactly what standard to follow.

interface LangMeta {
  formalName: string;         // exact language name to use in the prompt
  styleGuide: string;         // human-readable style authority
  formatter: string;          // native formatter tool name
  defaultQuote: QuoteStyle;   // language-idiomatic default
  conventionNotes: string[];  // specific rules that catch common mistakes
}

const LANG_META: Record<string, LangMeta> = {
  python: {
    formalName: "Python",
    styleGuide: "PEP 8",
    formatter: "Black",
    defaultQuote: "double",
    conventionNotes: [
      "Two blank lines between top-level definitions (functions, classes)",
      "One blank line between methods inside a class",
      "Spaces around all binary operators",
      "No space before a colon in slices or type hints",
      "Trailing comma in multi-line collections",
    ],
  },
  javascript: {
    formalName: "JavaScript",
    styleGuide: "Airbnb / Prettier defaults",
    formatter: "Prettier",
    defaultQuote: "double",
    conventionNotes: [
      "Always use semicolons",
      "Arrow functions for callbacks",
      "const for values that are never reassigned, let otherwise",
      "Trailing commas in multi-line arrays and objects",
    ],
  },
  typescript: {
    formalName: "TypeScript",
    styleGuide: "Airbnb / Prettier / TSLint defaults",
    formatter: "Prettier",
    defaultQuote: "double",
    conventionNotes: [
      "Always use semicolons",
      "Explicit return types on exported functions",
      "Prefer interface over type for object shapes",
      "Trailing commas in multi-line generics and parameter lists",
    ],
  },
  java: {
    formalName: "Java",
    styleGuide: "Google Java Style Guide",
    formatter: "google-java-format",
    defaultQuote: "double",
    conventionNotes: [
      "Opening brace on the same line (K&R style)",
      "4-space indentation (Google uses 2, but 4 is more widely used — follow tabSize)",
      "One blank line between methods",
      "Annotations on their own line",
      "Static imports before regular imports",
    ],
  },
  go: {
    formalName: "Go",
    styleGuide: "Effective Go / gofmt",
    formatter: "gofmt",
    defaultQuote: "double",
    conventionNotes: [
      "Tabs for indentation (Go standard — override tabSize is ignored)",
      "Opening brace on the same line — never on a new line",
      "No unused imports or variables",
      "Group imports: stdlib, then external, separated by a blank line",
      "Error checks immediately after the call that can return an error",
    ],
  },
  rust: {
    formalName: "Rust",
    styleGuide: "Rust Style Guide / rustfmt",
    formatter: "rustfmt",
    defaultQuote: "double",
    conventionNotes: [
      "snake_case for variables and functions, PascalCase for types",
      "No trailing semicolons on the last expression in a block (it becomes the return value)",
      "Explicit lifetimes only when necessary",
      "Prefer .unwrap_or / .map over explicit match for simple Option/Result",
    ],
  },
  cpp: {
    formalName: "C++",
    styleGuide: "Google C++ Style Guide",
    formatter: "clang-format",
    defaultQuote: "double",
    conventionNotes: [
      "Opening brace on the same line as the statement",
      "Pointer and reference operators attached to the type (int* p, int& r)",
      "Two blank lines between top-level definitions",
      "include order: related header, C system, C++ standard, other",
    ],
  },
  csharp: {
    formalName: "C#",
    styleGuide: "Microsoft C# Coding Conventions",
    formatter: "dotnet-format",
    defaultQuote: "double",
    conventionNotes: [
      "Opening brace on a new line (Allman style)",
      "PascalCase for public members, camelCase for private fields with underscore prefix (_field)",
      "Explicit access modifiers on every member",
      "var only when the type is obvious from the right-hand side",
    ],
  },
  ruby: {
    formalName: "Ruby",
    styleGuide: "The Ruby Style Guide (RuboCop defaults)",
    formatter: "RuboCop",
    defaultQuote: "single",
    conventionNotes: [
      "2-space indentation",
      "Single quotes for strings without interpolation",
      "No parentheses on method calls with no arguments",
      "Prefer map/select/reject over each for transformations",
      "Trailing newline at end of file",
    ],
  },
  php: {
    formalName: "PHP",
    styleGuide: "PSR-12",
    formatter: "PHP CS Fixer",
    defaultQuote: "single",
    conventionNotes: [
      "Opening brace for classes and functions on a new line",
      "Opening brace for control structures on the same line",
      "Type declarations on all function parameters and return types",
      "No closing ?> tag in PHP-only files",
    ],
  },
  swift: {
    formalName: "Swift",
    styleGuide: "Swift API Design Guidelines / SwiftLint",
    formatter: "swift-format",
    defaultQuote: "double",
    conventionNotes: [
      "camelCase for variables and functions, PascalCase for types",
      "Trailing closures when the last argument is a closure",
      "Avoid explicit self except where required",
      "Prefer guard let over if let for early exits",
    ],
  },
  kotlin: {
    formalName: "Kotlin",
    styleGuide: "Kotlin Coding Conventions",
    formatter: "ktlint",
    defaultQuote: "double",
    conventionNotes: [
      "camelCase for functions and variables, PascalCase for classes",
      "Prefer val over var whenever possible",
      "Trailing lambda outside parentheses",
      "No semicolons",
      "Single-expression functions with = instead of braces when possible",
    ],
  },
  dart: {
    formalName: "Dart",
    styleGuide: "Effective Dart",
    formatter: "dart format",
    defaultQuote: "single",
    conventionNotes: [
      "camelCase for identifiers, PascalCase for classes",
      "Prefer single quotes for strings",
      "Trailing commas in multi-line argument lists (enables better dart format output)",
      "Use ?. and ?? for null safety",
    ],
  },
  sql: {
    formalName: "SQL",
    styleGuide: "SQL Style Guide (Simon Holywell)",
    formatter: "sqlfluff",
    defaultQuote: "double",
    conventionNotes: [
      "ALL CAPS for reserved keywords (SELECT, FROM, WHERE, JOIN, etc.)",
      "Lowercase for table names, column names, and aliases",
      "Each clause (SELECT, FROM, WHERE) on its own line",
      "Indented column lists with leading commas for readability",
      "Explicit JOIN type (INNER JOIN, LEFT JOIN — never plain JOIN)",
    ],
  },
  bash: {
    formalName: "Shell (Bash)",
    styleGuide: "Google Shell Style Guide",
    formatter: "shfmt",
    defaultQuote: "double",
    conventionNotes: [
      "#!/usr/bin/env bash shebang on the first line if missing",
      "Double-quote all variable expansions: \"$var\"",
      "$(command) substitution instead of backticks",
      "2-space indentation",
      "Functions declared as: name() { … }",
    ],
  },
  r: {
    formalName: "R",
    styleGuide: "Tidyverse Style Guide",
    formatter: "styler",
    defaultQuote: "double",
    conventionNotes: [
      "snake_case for variable and function names",
      "Spaces around <- and all binary operators",
      "No semicolons",
      "Pipe operator |> (base R) or %>% (magrittr) on a new line",
      "One statement per line",
    ],
  },
  scala: {
    formalName: "Scala",
    styleGuide: "Scala Style Guide / scalafmt",
    formatter: "scalafmt",
    defaultQuote: "double",
    conventionNotes: [
      "camelCase for vals and defs, PascalCase for classes and objects",
      "Avoid var — prefer val and immutable data",
      "Pattern matching over if/else chains",
      "Curried function syntax for partial application",
    ],
  },
  lua: {
    formalName: "Lua",
    styleGuide: "Lua Style Guide",
    formatter: "StyLua",
    defaultQuote: "double",
    conventionNotes: [
      "2-space indentation",
      "snake_case for variable and function names",
      "local keyword for all variables to avoid global scope pollution",
      "No semicolons unless needed to disambiguate",
    ],
  },
};

// Fallback metadata for languages not in the table above
function getFallbackMeta(language: string): LangMeta {
  const name =
    language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  return {
    formalName: name,
    styleGuide: `standard ${name} conventions`,
    formatter: `the official ${name} formatter`,
    defaultQuote: "double",
    conventionNotes: [
      `Follow the official ${name} style guide`,
      "Consistent indentation throughout",
      "Logical blank-line grouping",
    ],
  };
}

// ─── Core builder ─────────────────────────────────────────────────────────────

/**
 * Builds an LLM prompt that instructs the model to format source code
 * for a given language, following its canonical style guide.
 *
 * @param options - Formatting preferences and the code to format.
 * @returns A ready-to-send prompt string.
 */
export function buildFormatCodePrompt(options: FormatCodeOptions): string {
  const {
    language,
    code,
    tabSize = 2,
    indentStyle = "space",
    quoteStyle = "auto",
    printWidth = 80,
    stripBlankLines = false,
  } = options;

  if (!language?.trim()) throw new Error("buildFormatCodePrompt: `language` is required.");
  if (!code?.trim())     throw new Error("buildFormatCodePrompt: `code` is required.");

  const langKey = language.trim().toLowerCase();
  const meta    = LANG_META[langKey] ?? getFallbackMeta(language);

  // Resolve quote style
  const resolvedQuote =
    quoteStyle === "auto" ? meta.defaultQuote : quoteStyle;

  // Resolve indent description
  const indentDescription =
    indentStyle === "tab"
      ? "hard tabs (\\t)"
      : `${tabSize} spaces per indent level`;

  // Build language-specific convention block
  const conventionBlock = meta.conventionNotes
    .map((note, i) => `   ${i + 1}. ${note}`)
    .join("\n");

  // Build the blank-line instruction
  const blankLineInstruction = stripBlankLines
    ? "• Remove ALL blank lines from the output — the result will be processed line-by-line by a downstream model."
    : "• Preserve meaningful blank lines that aid readability (e.g. between logical blocks, functions, classes).";

  // ── Prompt ─────────────────────────────────────────────────────────────────

  const prompt = `You are an expert ${meta.formalName} code formatter — the equivalent of running ${meta.formatter} on the code.

═══════════════════════════════════════════════════════════
 TASK
═══════════════════════════════════════════════════════════
Format the ${meta.formalName} code provided below, strictly following the ${meta.styleGuide}.

═══════════════════════════════════════════════════════════
 NON-NEGOTIABLE OUTPUT RULES  (violations = wrong answer)
═══════════════════════════════════════════════════════════
1. Return ONLY the formatted code — nothing else.
2. No markdown code fences, no backticks, no triple quotes.
3. No explanation, commentary, preamble, or postamble.
4. Do NOT add, remove, rename, or alter ANY logic, variables,
   functions, comments, or imports. Formatting only.
5. If the code contains a syntax error that makes it
   impossible to format, return it exactly as given
   (no error message — just the original code unchanged).

═══════════════════════════════════════════════════════════
 FORMATTING SPECIFICATION
═══════════════════════════════════════════════════════════
• Language         : ${meta.formalName}
• Style authority  : ${meta.styleGuide}
• Indentation      : ${indentDescription}
• Max line width   : ${printWidth} characters (wrap long lines intelligently)
• Quote style      : ${resolvedQuote} quotes (where the language allows a choice)
${blankLineInstruction}

═══════════════════════════════════════════════════════════
 ${meta.formalName.toUpperCase()} STYLE CONVENTIONS TO ENFORCE
═══════════════════════════════════════════════════════════
${conventionBlock}

═══════════════════════════════════════════════════════════
 CODE TO FORMAT
═══════════════════════════════════════════════════════════
${code}`;

  return prompt;
}

// ─── Convenience re-exports ───────────────────────────────────────────────────

/** List of all languages with built-in style metadata. */
export const SUPPORTED_LANGUAGES = Object.keys(LANG_META);

/** Check whether a language has a built-in style guide entry. */
export function isLanguageSupported(language: string): boolean {
  return language.trim().toLowerCase() in LANG_META;
}