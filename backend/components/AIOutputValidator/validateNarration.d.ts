interface FlowNode {
    id: string;
    type: "start" | "process" | "decision" | "end";
    title: string;
    description: string;
    code_ranges: {
        line_start: number;
        line_end: number;
    }[];
    next: string[];
}
export declare function validateNarration(data: unknown, sourceLineCount: number): asserts data is {
    flow_map: FlowNode[];
};
export {};
//# sourceMappingURL=validateNarration.d.ts.map