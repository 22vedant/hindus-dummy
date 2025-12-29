import type { Request, Response, NextFunction } from 'express';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';
import { QuizService } from '@/services/quiz.service.ts';

const quizService = new QuizService()

export const createQuiz = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.uid
        const body = req.body
        if (!uid) return res.status(404).json({
            message: "Not Found"
        })

        const quizId = await quizService.createQuiz(uid, body)

        return res.status(201).json({
            mesasge: "The quiz has been created",
            quizId
        })
    } catch (error: any) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }

}

export const createQuestion = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.uid as string
        const body = req.body
        if (!uid) return res.status(404).json({ message: 'Not found' });


        await quizService.createQuestion(uid, body)

        return res.status(201).json({
            message: "The question has been created"
        })

    } catch (error) {
        next(error)
    }
}

export const submitQuiz = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const quizId = req.query.quizId as string;
        const uid = req.uid as string
        const body = req.body
        if (!quizId) {
            return res.status(400).json({ message: "Quiz Id is missing" });
        }


        const { submissionId, options } = await quizService.submitQuiz(quizId, uid, body)
        return res.status(200).json({
            message: "Submitted Successfully",
            options: options,
            submissionId
        });
    } catch (error) {
        next(error)
    }

}

export const getResult = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const quizId = req.query.quizId as string;
        const submissionId = req.query.submissionId as string
        const uid = req.uid as string

        if (!quizId || !submissionId) {
            return res.status(400).json({ message: "Missing Credentials" });
        }

        const responseData = await quizService.getResult(quizId, uid, submissionId)
        return res.status(200).json(responseData)
    } catch (error) {
        next(error)
    }
}

