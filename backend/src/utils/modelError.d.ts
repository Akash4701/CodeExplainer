export interface UserFacingModelError {
    status: number;
    code: string;
    title: string;
    message: string;
    retryable: boolean;
    retryAfter?: number;
    details?: string;
}
export declare function normalizeModelError(error: unknown): UserFacingModelError;
//# sourceMappingURL=modelError.d.ts.map