class ApiError extends Error {
   
    public statusCode: number;
    public success: boolean;
    public errors: string[];
    public data: null;
  
    constructor(statusCode: number, message: string, errors: string[] = [], stack?: string) {
        super(message); 
        this.statusCode = statusCode;

        this.message = message;
        this.success = false;
        this.data=null;

        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}