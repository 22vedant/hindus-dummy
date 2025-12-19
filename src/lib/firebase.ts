import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin";
import serviceAccountJSON from "./empdata-bf69b-374286502f03.json" with { type: "json" };
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = serviceAccountJSON as ServiceAccount;;


let firebase1;

// if (process.env.NODE_ENV == "development") {
//   firebase1 = initializeApp()
// } else {
//   firebase1 = initializeApp({
//     credential: cert(serviceAccount),
//     projectId: "empdata-bf69b",
//     storageBucket: "empdata-bf69b.appspot.com",
//   });
// }

export const firebaseApp = initializeApp({
  credential: applicationDefault(),
  projectId: "empdata-bf69b"
})

export const db = getFirestore(firebaseApp)

export const bucket: any = getStorage();