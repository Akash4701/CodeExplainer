export function safeParse(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error("Invalid JSON");
    }
}
//# sourceMappingURL=safeParse.js.map