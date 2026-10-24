export function normalize(text) {
    return text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
}
//# sourceMappingURL=normalize.js.map