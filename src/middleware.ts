import type { Request, Response, NextFunction } from "express";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import type { authMiddlewareInfoRequest } from "./lib/types/index.ts";
import { getFirestore } from "firebase-admin/firestore";

export const userAuthMiddleware = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).send("Missing or invalid token");
        }

        const token = authHeader.split(" ")[1];
        const decoded = await getAuth().verifyIdToken(token!);
        const uid = decoded.sub
        req.uid = uid
        next()
    } catch (error: unknown) {
        res.status(500).json({
            message: error
        })
    }
}

export const isAdmin = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    const userRef = await getFirestore("h-dummy-db").collection("users").doc(req.uid!).get()
    if (userRef.data()?.role !== "ADMIN") {
        return res.status(403).json({
            message: "You are forbidden"
        })
    }
    next()
}

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

export const quizQuestionsCreateChecker = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    const requiredFields = ['title', 'description', 'options', 'correctOption', 'explanation', 'questionType'];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `Missing required field: ${field}`
            });
        }
    }

    next()
}

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
