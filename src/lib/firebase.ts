import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import { Bucket } from "@google-cloud/storage";
import type { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";
import serviceAccountJSON from "./service-account-hindus.json" with { type: "json" };
const serviceAccount = serviceAccountJSON as ServiceAccount;

dotenv.config();

export const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  storageBucket: "first-test-12cd8.firebasestorage.app",
});

export const bucket: any = getStorage();
