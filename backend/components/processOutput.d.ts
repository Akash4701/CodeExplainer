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
export declare function processGeminiOutput(raw: string, code: string): {
    flow_map: FlowNode[];
} | {
    error: string;
};
export {};
//# sourceMappingURL=processOutput.d.ts.map