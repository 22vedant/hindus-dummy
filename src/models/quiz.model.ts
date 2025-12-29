import { db } from "@/lib/firebase.ts";

export interface QuizModelSchema {
    contentId: string
    title: string,
    description: string,
    language: string,
    passingScore: number,
    maxAttempts: number,
    createdAt: Date,
    createdBy: string,
    updatedAt: Date,
    updatedBy: string,
    quizType: string[],
    numberOfQuestions: number,
    questions: string[],
    attempts: number
}

export class QuizModel {
    private collection = db.collection("quiz")

    contentId: string;
    title: string;
    description: string;
    language: string;
    passingScore: number
    maxAttempts: number;
    quizType: string[];
    numberOfQuestions: number;

    constructor(data: Partial<QuizModelSchema>) {
        this.contentId = data.contentId ?? "";
        this.title = data.title ?? "";
        this.description = data.description ?? "";
        this.language = data.language ?? "";
        this.passingScore = data.passingScore ?? 0;
        this.maxAttempts = data.maxAttempts ?? 0;
        this.quizType = data.quizType ?? [];
        this.numberOfQuestions = data.numberOfQuestions ?? 0;
    }

    // access to firebase.
}

