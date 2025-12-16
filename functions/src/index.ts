import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/https";

import { user } from "firebase-functions/v1/auth";
// import admin from "firebase-admin"
import { onSchedule, ScheduleOptions } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import dotenv from "dotenv"

import { initializeApp } from "firebase-admin/app"
dotenv.config()
initializeApp()

export const onDeleteCascade = user().onDelete(async (user) => {
    try {
        const uid = user.uid;
        const userRef = await getFirestore().collection("users").doc(uid)
        // const userDoc = await userRef.get()


        // const owns = userDoc.data()!.owns || []

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

const ScheduleOptions: ScheduleOptions = {
    schedule: '40 18 * * *',
    timeZone: 'Asia/Kolkata',
};

export const daily6PMQuizGen = onSchedule(
    ScheduleOptions,
    async () => {
        const userDetails = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            returnSecureToken: true,
        };

        let url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`;

        if (process.env.NODE_ENV === "development") {
            url =
                "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key";
        }

        logger.info(process.env.NODE_ENV)
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


// Your scheduled function


// export const daily6PMQuizGen = onSchedule(
//     ScheduleOptions,
//     async () => {
//         await runQuizGeneration();
//     }
// );

// // Dev-only trigger
// export const devTriggerQuizGen = onRequest(async (req, res) => {
//     if (process.env.NODE_ENV !== "development") {
//         res.status(403).send("Not available in production");
//         return;
//     }

//     try {
//         await runQuizGeneration();
//         res.send("Quiz generation completed successfully");
//     } catch (error) {
//         res.status(500).send(`Error: ${error}`);
//     }
// });

// // Extract your logic to a separate function
// async function runQuizGeneration() {
//     const userDetails = {
//         email: process.env.ADMIN_EMAIL,
//         password: process.env.ADMIN_PASSWORD,
//         returnSecureToken: true,
//     };

//     let url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`;

//     if (process.env.NODE_ENV === "development") {
//         url =
//             "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key";
//     }

//     logger.info(process.env.NODE_ENV);
//     logger.info(process.env.ADMIN_PASSWORD);
//     logger.info(process.env.ADMIN_EMAIL);

//     const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userDetails),
//     });

//     logger.info("Auth response status:", response.status);
//     const data = await response.json();
//     logger.info("Auth response data:", data);
// }

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    logger.info(process.env.NODE_ENV)
    logger.info(process.env.ADMIN_PASSWORD)
    logger.info(process.env.ADMIN_EMAIL)

    response.send("Hello from Firebase!");
});
