import type { Response, NextFunction } from "express";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.js";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto"

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