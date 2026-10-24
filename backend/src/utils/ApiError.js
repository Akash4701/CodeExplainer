class ApiError extends Error {
    statusCode;
    success;
    errors;
    data;
    constructor(statusCode, message, errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.data = null;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export { ApiError };
//# sourceMappingURL=ApiError.js.map