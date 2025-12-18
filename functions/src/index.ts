import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/https";
import { getMessaging } from "firebase-admin/messaging";

import { user } from "firebase-functions/v1/auth";
// import admin from "firebase-admin"
import { onSchedule, ScheduleOptions } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import dotenv from "dotenv"

import { initializeApp } from "firebase-admin/app"
dotenv.config()
const app = initializeApp({ projectId: 'empdata-bf69b' })
const messaging = getMessaging(app)

interface quizGenBody {
    title: string
    description: string
    language: string
    passingScore: number
    maxAttempts: number
    quizType: string
    numberOfQuestions: number
}

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

export const daily6PMQuizGenEnglish = onSchedule(
    options,
    async () => {
        // const db = getFirestore("h-dummy-db")
        try {
            const userDetails = {
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                returnSecureToken: true,
            };

            let loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`;
            // logger.info(process.env.NODE_ENV)

            const response = await fetch(loginUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userDetails),
            });

            const data = await response.json()

            if (typeof response == undefined || !response) {
                throw new Error("Response is not correct")
            }

            const now = new Date(Date.now())

            const body: quizGenBody = {
                title: `Daily Quiz for ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
                description: `Daily generated quiz`,
                language: 'english',
                passingScore: 4,
                maxAttempts: 3,
                quizType: 'daily',
                numberOfQuestions: 6,
            }

            const quizUrl = `` // add url here

            const quizResponse = await fetch(quizUrl,
                {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${data?.idToken}` },
                    body: JSON.stringify(body)
                })

            if (!quizResponse.ok) {
                throw new Error("Error during quiz generation")
            }

            logger.log("Quiz Generated Successfully")
        } catch (error: any) {
            logger.log(error.message)
        }
    }
);

export const manualSendMessage = onRequest(async (_request, response): Promise<void> => {
    try {
        const tokens = ['cEbpTlmNkNxUTQhpk7WM06:APA91bHc6m30xUi4sQCnoH90E8nUpSOg4axnXTnesuDOUc68y0deZ6Q7wXqI2Bn5FUxUgLxg4ZDTgWku4iRQI5Z45zj_ywzkjGzgZbMuD6HTlMsu3XXeIlc', 'dEh0k7XqLCLLWi5P-xyvYB:APA91bEVu49wXrknCFvkqCxAQ-eJg8xURrHly18WXfu01e04aOCA8mab00PEoNkIbS0WdZi5MQIdSEMX3RbteWnA0zhCEbqSg7XRm10hkSxSWfRWIUw5Lak']
        const message = {
            notification: {
                title: "New Quiz Available",
                body: "A new daily quiz is generated for you."
            },
            tokens: tokens
        }

        const res = await messaging.sendEachForMulticast(message)

        const failedTokens: string[] = [];
        if (res.failureCount > 0) {

            res.responses.forEach((resp, index) => {
                if (!resp.success) {
                    failedTokens.push(tokens[index])
                }
            })
        }

        logger.info("Sent message successfully");
        logger.error(`These tokens failed`, failedTokens)
        response.status(200).json({
            message: "Successfully sent the message"
        })
    } catch (error: any) {
        logger.error(error);

        response.status(500).json({
            error: error.message ?? String(error),
        });
        return;
    }
})

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
