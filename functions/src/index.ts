import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/https";

import { user } from "firebase-functions/v1/auth";
// import admin from "firebase-admin"
import { onSchedule, ScheduleOptions } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import dotenv from "dotenv"

import { initializeApp } from "firebase-admin/app"
dotenv.config()
initializeApp({ projectId: 'empdata-bf69b' })


export const onDeleteCascade = user().onDelete(async (user) => {
    try {
        const db = getFirestore("h-dummy-db")
        const uid = user.uid;
        const userRef = db.collection("users").doc(uid)

        await userRef.delete()

        console.log("user deleted");

        return {
            message: `All related to user ${uid} is successfully deleted`,
        }

    } catch (error) {
        return {
            error: error
        }
    }

})

const options: ScheduleOptions = {
    schedule: '45 14 * * *',
    timeZone: 'Asia/Kolkata',
};

export const daily6PMQuizGen = onSchedule(
    options,
    async () => {
        // const db = getFirestore("h-dummy-db")
        const userDetails = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            returnSecureToken: true,
        };

        let url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`;

        // if (process.env.NODE_ENV === "development") {
        //     url =
        //         "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key";
        // }

        // logger.info(process.env.NODE_ENV)
        logger.info(process.env.ADMIN_PASSWORD)
        logger.info(process.env.ADMIN_EMAIL)

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userDetails),
        });

        logger.info("Auth response status:", response);
    }
);

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
