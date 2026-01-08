import { Router, type Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "@/middlewares/isAdmin.ts";
import { userAuthMiddleware } from "@/middlewares/userAuth.ts";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.ts";
import { db } from "@/lib/firebase.ts";
import * as quizController from "@/controllers/quiz.controller.ts"
import { apiKeyChecker } from "@/middlewares/apiKeyChecker.ts";
import { validate } from "@/middlewares/validate.ts";
import { createQuestionSchema, createQuizSchema } from "@/validators/quiz.validator.ts";
const quizRouter = Router()

/**
 * @openapi
 * /v1/quiz/health:
 *   get:
 *     tags:
 *       - Quiz
 *     produces:
 *       - application/json
 *     responses:
 *       "200":
 *         description: "inside quiz route"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "inside quiz route"
 */
quizRouter.get('/heatlh', (req, res) => {
    return res.json({
        message: "inside quiz Router"
    })
})

/**
 * @openapi
 * /v1/quiz:
 *   post:
 *     tags:
 *       - Quiz
 *     summary: Create Quiz
 *     description: An API route to create a new quiz
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuizBody'
 *     responses:
 *       200:
 *         description: Some description...
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

quizRouter.post('/create', userAuthMiddleware, apiKeyChecker, isAdmin,
    // validate(createQuizSchema), 
    quizController.createQuiz
)

/**
 * @openapi
 * /v1/quiz/questions:
 *   post:
 *     tags:
 *       - Quiz
 *     summary: Create Quiz Questions
 *     description: >
 *       An API route to create questions required for quiz.
 *       Only one question is allowed in each query.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: quizId
 *         in: query
 *         description: The quizId of quiz being submitted
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitQuizBody'
 *     responses:
 *       200:
 *         description: Some description...
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

quizRouter.post("/questions/create", userAuthMiddleware, apiKeyChecker, isAdmin, validate(createQuestionSchema), quizController.createQuestion)

quizRouter.post("/submit", userAuthMiddleware, quizController.submitQuiz);

/**
 * @openapi
 * /v1/quiz/result:
 *   get:
 *     tags:
 *       - Quiz
 *     summary: Get Quiz Results
 *     description: An API route to fetch quiz results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: quizId
 *         in: query
 *         description: The quizId of the attempted quiz
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *       - name: submissionId
 *         in: query
 *         description: The submissionId of the attempted quiz
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Some description...
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

quizRouter.get("/result", userAuthMiddleware, quizController.getResult)

export default quizRouter