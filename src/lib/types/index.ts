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
    subscribedTo?: string[]
    role?: string

}

export interface User {
    uid: string
    role?: string
    email?: string
}

export interface tokenGen {
    email: string;
    password: string
    returnSecureToken: boolean
}

export interface questionBody {
    title: string,
    description: string,
    options: string,
    correctOption: string,
    explanation: string,
    questionType: string,
}