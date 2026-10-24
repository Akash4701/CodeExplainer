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
/**
 * Builds an LLM prompt that instructs the model to format source code
 * for a given language, following its canonical style guide.
 *
 * @param options - Formatting preferences and the code to format.
 * @returns A ready-to-send prompt string.
 */
export declare function buildFormatCodePrompt(options: FormatCodeOptions): string;
/** List of all languages with built-in style metadata. */
export declare const SUPPORTED_LANGUAGES: string[];
/** Check whether a language has a built-in style guide entry. */
export declare function isLanguageSupported(language: string): boolean;
//# sourceMappingURL=CodeFormatterPrompt.d.ts.map