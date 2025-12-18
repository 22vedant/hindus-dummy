import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin";
import serviceAccountJSON from "./empdata-bf69b-374286502f03.json" with { type: "json" };
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = serviceAccountJSON as ServiceAccount;;

export const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: "empdata-bf69b",
  storageBucket: "empdata-bf69b.appspot.com",
});

export const db = getFirestore(firebaseApp, "h-dummy-db")

export const bucket: any = getStorage();