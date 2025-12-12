
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { user } from "firebase-functions/v1/auth";

export const onDeleteCascade = user().onDelete(async (user) => {
    try {
        const uid = user.uid;
        const userRef = await getFirestore().collection("users").doc(uid)
        const userDoc = await userRef.get()

        const owns = userDoc.data()!.owns || []

        console.log(owns);

        const contentRef = await getFirestore().collection("content")

        // if (Array.isArray(owns) && owns.length > 0) {
        //     await Promise.all(owns.map((contentId) => {
        //         contentRef.doc(contentId).delete()
        //     }))
        // }

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

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
