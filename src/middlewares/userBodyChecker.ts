import type { Request, Response, NextFunction } from "express";

export const userCreationBodyChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requiredFields = ['email', 'password', 'displayName', 'role', 'subscribedTo'];

    for (const field of requiredFields) {
        if (!req.body?.[field]) {
            return res.status(400).json({
                message: `Missing required field: ${field}`,
            });
        }
    }

    next();
};
