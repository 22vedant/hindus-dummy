import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import type { Request } from "express";


export interface authMiddlewareInfoRequest extends Request {
    uid?: string;
    decoded?: DecodedIdToken;
}

export interface myUserRecord {
    email: string;
    password?: string;
    emailVerified: boolean;
    displayName: string
    photoUrl?: string
    disabled?: boolean
    phoneNumber?: string
}