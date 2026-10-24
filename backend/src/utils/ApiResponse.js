class ApiResponse {
    statusCode;
    message;
    data;
    success;
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
export { ApiResponse };
//# sourceMappingURL=ApiResponse.js.map