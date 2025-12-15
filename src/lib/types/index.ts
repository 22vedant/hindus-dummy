import type { DecodedIdToken } from "firebase-admin/auth";
import type { Request } from "express";

export interface authMiddlewareInfoRequest extends Request {
    uid?: string;
    decoded?: DecodedIdToken;
}