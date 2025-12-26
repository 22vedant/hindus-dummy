import type { Response, NextFunction } from "express";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.ts";

export const quizCreateBodyChecker = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    const requiredFields = ['contentId', 'title', 'description', 'language', 'passingScore', 'maxAttempts', 'quizType', 'numberOfQuestions'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `Missing required field: ${field}`
            });
        }
    }

    next()
}
