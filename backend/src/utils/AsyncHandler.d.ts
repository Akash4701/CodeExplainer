import type { Request, Response, NextFunction } from "express";
interface AsyncRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void> | void;
}
export declare const asyncHandler: (requestHandler: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=AsyncHandler.d.ts.map