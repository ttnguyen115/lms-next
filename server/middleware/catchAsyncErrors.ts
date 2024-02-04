import { type NextFunction, type Request, type Response } from "express";

export const CatchAsyncErrors =
    (func: any) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(func(req, res, next)).catch(next);
    };
