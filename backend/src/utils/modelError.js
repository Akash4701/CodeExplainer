function getErrorText(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "string")
        return error;
    if (error && typeof error === "object") {
        const record = error;
        if (typeof record.message === "string")
            return record.message;
        if (typeof record.error?.message === "string")
            return record.error.message;
    }
    return "Unknown model provider error";
}
export function normalizeModelError(error) {
    const details = getErrorText(error);
    const record = error && typeof error === "object"
        ? error
        : {};
    const rawStatus = typeof record.status === "number"
        ? record.status
        : typeof record.statusCode === "number"
            ? record.statusCode
            : undefined;
    const statusMatch = /['"]?status['"]?\s*[:=]\s*['"]?(\d{3})/i.exec(details);
    const parsedStatus = rawStatus ?? (statusMatch?.[1] ? Number(statusMatch[1]) : undefined);
    const retryMatch = /retry(?:[_ -]?delay| in)?[^0-9]*(\d+(?:\.\d+)?)\s*(ms|s|sec(?:ond)?s?|m|min(?:ute)?s?)/i.exec(details);
    let retryAfter;
    if (retryMatch?.[1] && retryMatch[2]) {
        const amount = Number(retryMatch[1]);
        const unit = retryMatch[2].toLowerCase();
        retryAfter = unit.startsWith("m")
            ? Math.ceil(amount * 60)
            : unit.startsWith("ms")
                ? Math.ceil(amount / 1000)
                : Math.ceil(amount);
    }
    if (parsedStatus === 429 || /429|too many requests|resource exhausted|rate.?limit|high demand/i.test(details)) {
        return {
            status: 429,
            code: "MODEL_BUSY",
            title: "The AI is receiving too many requests",
            message: "The model is temporarily busy or has reached a usage limit. Wait a moment, then try again.",
            retryable: true,
            retryAfter: retryAfter ?? 30,
            details,
        };
    }
    if (parsedStatus === 503 || /503|service unavailable|overloaded/i.test(details)) {
        return {
            status: 503,
            code: "MODEL_UNAVAILABLE",
            title: "The AI is temporarily unavailable",
            message: "The model service is temporarily unavailable. Please try again shortly.",
            retryable: true,
            retryAfter: retryAfter ?? 15,
            details,
        };
    }
    if (parsedStatus === 401 || parsedStatus === 403 || /api key|unauthorized|permission denied/i.test(details)) {
        return {
            status: parsedStatus ?? 403,
            code: "MODEL_ACCESS_ERROR",
            title: "AI service configuration needs attention",
            message: "The app could not authenticate with the AI service. Please try again later or contact support.",
            retryable: false,
            details,
        };
    }
    if (parsedStatus && parsedStatus >= 500) {
        return {
            status: 502,
            code: "MODEL_REQUEST_FAILED",
            title: "We could not reach the AI",
            message: "The AI service did not return a result. Please try again.",
            retryable: true,
            retryAfter: retryAfter ?? 10,
            details,
        };
    }
    return {
        status: 502,
        code: "MODEL_REQUEST_FAILED",
        title: "Something went wrong",
        message: "The AI could not complete this request. Please try again.",
        retryable: true,
        retryAfter: retryAfter ?? 10,
        details,
    };
}
//# sourceMappingURL=modelError.js.map