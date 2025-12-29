import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/https";
import { getMessaging } from "firebase-admin/messaging";

import { user } from "firebase-functions/v1/auth";
import { onSchedule, type ScheduleOptions } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app"
import dotenv from "dotenv"

dotenv.config()
const app = initializeApp({ projectId: 'empdata-bf69b' })
const messaging = getMessaging(app)
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

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
        const tokens = ['dEh0k7XqLCLLWi5P-xyvYB:APA91bGaUgLbQBSMppRkK4srpeUyxqP1-Kq0K5Isg-Nb9Td4uGdoiN-PE5t-2m6mb_5bPMPyf6QBTsixL07ZO5cgaHMCN-aiqe9N2dVCY2iiqiw6VU_eKVw']
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
            logger.error(`These tokens failed`, failedTokens)
        }

        let emailsArray: string[] = []

        // getFirestore("h-dummy-db").collection("mailingList")
        const userSnapShot = (await getFirestore().collection("mailingLists").doc("A").get()).data()
        emailsArray = userSnapShot?.emails

        const mailMessage = {
            to: emailsArray, // Change to your recipient
            from: 'vedant.chinta@zingworks.co', // Change to your verified sender
            subject: 'Daily Quiz Generated',
            text: 'A new quiz is generated just for you based on your subscription',
            html: '<strong>A new quiz is generated just for you based on your subscription</strong>',
        }

        await sgMail.sendMultiple(mailMessage)

        logger.info("Sent message successfully & mail send successfully");
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
