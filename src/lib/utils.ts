import crypto from "crypto"
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import type { User } from "./types/index.ts";
dotenv.config()

export const generateApiKeyV1 = () => {
    const length = 16
    return crypto.randomBytes(length).toString("base64")
}

export const generateApiKeyV2 = () => {
    const length = 24
    return crypto.randomBytes(length).toString("base64")
}

export const generateAccessToken = (user: User) => {
    return jwt.sign(
        {
            uid: user.uid,
            email: user.email,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1hr" }
    );
};


export const generateRefreshToken = (user: User) => {
    return jwt.sign(
        {
            uid: user.uid,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "30d" }
    );
};
