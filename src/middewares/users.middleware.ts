import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

export const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).send("Missing or invalid token");
        }

        const token = authHeader.split(" ")[1];
        const decoded = await getAuth().verifyIdToken(token!);
        const uid = decoded.uid
        next()
    } catch (error: unknown) {
        res.status(500).json({
            message: error
        })
    }
}