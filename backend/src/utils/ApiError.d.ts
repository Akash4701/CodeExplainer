declare class ApiError extends Error {
    statusCode: number;
    success: boolean;
    errors: string[];
    data: null;
    constructor(statusCode: number, message: string, errors?: string[], stack?: string);
}
export { ApiError };
//# sourceMappingURL=ApiError.d.ts.map