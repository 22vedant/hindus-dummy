import { Router, type Request, type Response } from "express";
import dotenv from "dotenv"
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const quizRouter = Router()

quizRouter.get('/', (req, res) => {
    return res.json({
        message: "inside quiz Router"
    })
})

quizRouter.post('/create', async (req, res) => {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Missing or invalid token"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = await getAuth().verifyIdToken(token!);
        const uid = decoded.uid;

        const userRef = await getFirestore().collection("users").doc(uid).get();
        if (userRef.data()?.role !== "ADMIN") {
            return res.status(403).json({
                message: "You are forbidden"
            });
        }

        const body = req.body;

        const requiredFields = ['contentId', 'title', 'description', 'language', 'passingScore', 'maxAttempts', 'quizType', 'numberOfQuestions'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return res.status(400).json({
                    message: `Missing required field: ${field}`
                });
            }
        }

        const quizSize = body.numberOfQuestions;

        // Fetch all questions
        const questionSnapshot = await getFirestore().collection("questions").get();
        const questionIdArray: string[] = [];
        questionSnapshot.forEach((doc) => {
            questionIdArray.push(doc.id);
        });

        // Check if enough questions exist
        if (questionIdArray.length < quizSize) {
            return res.status(400).json({
                message: `Not enough questions available. Requested: ${quizSize}, Available: ${questionIdArray.length}`
            });
        }

        // Fisher-Yates shuffle
        for (let i = questionIdArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionIdArray[i], questionIdArray[j]] = [questionIdArray[j]!, questionIdArray[i]!];
        }

        // Create a copy and select questions
        const refinedQuestionIdArray = questionIdArray.slice(0, quizSize);

        const quizDoc = {
            contentId: body.contentId,
            title: body.title,
            description: body.description,
            language: body.language,
            passingScore: body.passingScore,
            maxAttempts: body.maxAttempts,
            createdAt: new Date(),
            createdBy: uid,
            updatedAt: new Date(),
            updatedBy: uid,
            quizType: body.quizType,
            numberOfQuestions: body.numberOfQuestions,
            questions: refinedQuestionIdArray
        };

        await getFirestore().collection("quiz").add(quizDoc);

        return res.status(200).json({
            message: "Quiz created successfully",
            status_code: 200
        });

    } catch (error: any) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
});

quizRouter.post("/questions/create", async (req, res) => {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).send("Missing or invalid token");
        }

        const token = authHeader.split(" ")[1];
        const decoded = await getAuth().verifyIdToken(token!);
        const uid = decoded.uid;

        const userRef = await getFirestore().collection("users").doc(uid).get()
        if (userRef.data()?.role !== "ADMIN") {
            return res.status(403).json({
                message: "You are forbidden"
            })
        }

        const body = req.body;

        const questionsDoc = {
            title: body.title,
            description: body.description,
            options: body.options,
            correctOption: body.correctOption,
            explanation: body.explanation,
            questionType: body.questionType,
            createdBy: uid,
            updatedBy: uid,
            updatedAt: new Date(),
            createdAt: new Date()
        }

        await getFirestore().collection("questions").add(questionsDoc)
        return res.status(200).json({
            message: "Questions added successfully"
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error.message
        })
    }
})

quizRouter.post("/submit", async (req, res) => {

})

export default quizRouter