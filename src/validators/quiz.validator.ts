import { z } from "zod"


export const createQuizSchema = z.object({
    body: z.object({
        contentId: z.string(),
        title: z.string(),
        description: z.string().min(20),
        language: z.enum(['english', 'marathi', 'hindi']),
        passingScore: z.number(),
        maxAttempts: z.number(),
        quizType: z.array(z.enum(['educational', 'daily'])),
        numberOfQuestions: z.number()
    })
})

export const createQuestionSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string().min(20),
        options: z.object({
            A: z.string(),
            B: z.string(),
            C: z.string(),
            D: z.string()
        }),
        correctOption: z.enum(['A', 'B', 'C', 'D']),
        explanation: z.string(),
        questionType: z.enum(['educational', 'daily'])
    })
})