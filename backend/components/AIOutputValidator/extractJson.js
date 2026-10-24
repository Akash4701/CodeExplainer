export function extractJson(text) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
        throw new Error("No JSON found");
    }
    return text.slice(start, end + 1);
}
//# sourceMappingURL=extractJson.js.map