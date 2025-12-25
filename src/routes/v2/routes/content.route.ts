import { Router } from "express";
import type { Request, Response } from "express";
import type { authMiddlewareInfoRequest } from "../../../lib/types/index.ts";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const contentRouter2 = Router()

// contentRouter2.post()