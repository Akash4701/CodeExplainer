
import type{ Request, Response, NextFunction } from "express";

interface AsyncRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void> | void;
}

const asyncHandler = (requestHandler: AsyncRequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        Promise.resolve(requestHandler(req, res, next)).catch((error: Error) => {
            next(error);
        });
    };
};