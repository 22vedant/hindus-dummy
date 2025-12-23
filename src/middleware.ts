import type { Request, Response, NextFunction } from "express";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import type { authMiddlewareInfoRequest } from "./lib/types/index.js";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto"
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
    const userRef = await getFirestore().collection("users").doc(req.uid!).get()
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

export const apiKeyChecker = async (
    req: authMiddlewareInfoRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.get("x-api-key");
        const uid = req.uid;

        if (!apiKey) {
            return res.status(401).json({ message: "API key missing" });
        }

        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const apiKeyHash = crypto
            .createHash("sha256")
            .update(apiKey)
            .digest("hex");

        const userSnapshot = await getFirestore()
            .collection("users")
            .doc(uid)
            .get();

        if (!userSnapshot.exists) {
            return res.status(403).json({ message: "Invalid API key" });
        }

        const storedHash = userSnapshot.data()?.apiKeyHash;

        if (!storedHash) {
            return res.status(403).json({ message: "API key not configured" });
        }

        const isValid = crypto.timingSafeEqual(
            Buffer.from(apiKeyHash),
            Buffer.from(storedHash)
        );

        if (!isValid) {
            return res.status(403).json({ message: "Invalid API key" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};