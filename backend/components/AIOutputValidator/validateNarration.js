function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validateNarration(data, sourceLineCount) {
    if (!isRecord(data) || !Array.isArray(data.flow_map) || data.flow_map.length === 0) {
        throw new Error("flow_map must contain at least one execution node");
    }
    const flowTypes = new Set(["start", "process", "decision", "end"]);
    const flowMap = data.flow_map;
    const ids = new Set();
    for (const candidate of flowMap) {
        if (!isRecord(candidate) ||
            typeof candidate.id !== "string" ||
            !candidate.id.trim() ||
            ids.has(candidate.id) ||
            typeof candidate.type !== "string" ||
            !flowTypes.has(candidate.type) ||
            typeof candidate.title !== "string" ||
            !candidate.title.trim() ||
            typeof candidate.description !== "string" ||
            !candidate.description.trim() ||
            !Array.isArray(candidate.code_ranges) ||
            candidate.code_ranges.length === 0 ||
            !Array.isArray(candidate.next)) {
            throw new Error("Invalid flow_map entry");
        }
        ids.add(candidate.id);
        for (const value of candidate.code_ranges) {
            if (!isRecord(value)) {
                throw new Error("Invalid flow_map source range");
            }
            const { line_start, line_end } = value;
            if (typeof line_start !== "number" ||
                typeof line_end !== "number" ||
                !Number.isInteger(line_start) ||
                !Number.isInteger(line_end) ||
                line_start < 1 ||
                line_end < line_start ||
                line_end > sourceLineCount) {
                throw new Error("Invalid flow_map source range");
            }
        }
    }
    for (const candidate of flowMap) {
        if (!isRecord(candidate) || !Array.isArray(candidate.next)) {
            throw new Error("Invalid flow_map connection");
        }
        if (candidate.next.some((id) => typeof id !== "string" || !ids.has(id))) {
            throw new Error("Invalid flow_map connection");
        }
    }
}
//# sourceMappingURL=validateNarration.js.map