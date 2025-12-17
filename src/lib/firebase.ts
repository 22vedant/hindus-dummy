import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin";
import serviceAccountJSON from "./empdata-bf69b-96439c8a6270.json" with { type: "json" };
import { getFirestore } from "firebase-admin/firestore";
const serviceAccount = serviceAccountJSON as ServiceAccount;;

export const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: "empdata-bf69b",
  storageBucket: "empdata-bf69b.appspot.com",
});

export const db = getFirestore(firebaseApp, "h-dummy-db")

export const bucket: any = getStorage();

/**
 * 
 * const firebaseConfig = {

  apiKey: "AIzaSyAeT5O6U3ECusxz1eMKskEpqfcatqjiqHo",

  authDomain: "empdata-bf69b.firebaseapp.com",

  databaseURL: "https://empdata-bf69b-default-rtdb.firebaseio.com",

  projectId: "empdata-bf69b",

  storageBucket: "empdata-bf69b.appspot.com",

  messagingSenderId: "182702284982",

  appId: "1:182702284982:web:843fb858a5baca16d00617",

  measurementId: "G-P9JCY6JYYL"

};
 * 
 */