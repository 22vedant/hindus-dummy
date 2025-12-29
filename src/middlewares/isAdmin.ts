import type { Request, Response, NextFunction } from "express";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.js";
import { getFirestore } from "firebase-admin/firestore";

export const isAdmin = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    const userRef = await getFirestore().collection("users").doc(req.uid!).get()
    if (userRef.data()?.role !== "ADMIN") {
        return res.status(403).json({
            message: "You are forbidden"
        })
    }
    next()
}
