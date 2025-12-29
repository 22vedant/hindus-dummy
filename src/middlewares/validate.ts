import type { authMiddlewareInfoRequest } from "@/lib/types/index.ts";
import { ZodError, ZodType } from "zod";
import type { Response, NextFunction } from "express";

export const validate = (schema: ZodType) => {
    return async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query
            });

            req.validated = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.issues.map(issue => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    })),
                });
            }

            next(error);
        }
    };
};
