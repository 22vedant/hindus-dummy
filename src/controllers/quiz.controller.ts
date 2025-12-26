import type { Request, Response, NextFunction } from 'express';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';
import { QuizService } from '@/services/quiz.service.ts';

const model = new QuizService()

export const createQuestion = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.uid as string
        const body = req.body
        if (!uid) return res.status(404).json({ message: 'Not found' });


        await model.createQuestion(uid, body)

        return res.status(200).json({
            message: "The question has been created"
        })

    } catch (error) {
        next(error)
    }
}

export const submitQuiz = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {

}

