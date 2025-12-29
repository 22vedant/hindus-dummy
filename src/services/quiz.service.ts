import { db } from "@/lib/firebase.ts"
import type { questionBody } from "@/lib/types/index.ts"
import type { QuizModelSchema } from "@/models/quiz.model.ts"
import { FieldValue } from "firebase-admin/firestore"

export class QuizService {
    private quizCollection = db.collection("quiz")
    private questionsCollection = db.collection("questions")
    async createQuiz(uid, body) {
        const quizSize = body.numberOfQuestions;
        const questionSnapshot = await db.collection("questions").get()
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

        const refinedQuestionIdArray = questionIdArray.slice(0, quizSize);

        const quizDoc: Partial<QuizModelSchema> = {
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
            questions: refinedQuestionIdArray,
            attempts: 0
        };

        const quizSnapshot = await db.collection("quiz").add(quizDoc);
        return quizSnapshot.id
    }

    async createQuestion(uid: string, body: questionBody) {
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

        await this.questionsCollection.add(questionsDoc)

    }

    async submitQuiz(quizId: string, uid: string, body) {
        const quizSnapshot = await this.quizCollection.doc(quizId).get();
        if (!quizSnapshot.exists) {
            return null;
        }

        // const quizSnapshot = quizRef?.data()
        const quizData = quizSnapshot?.data()
        const passingScore = quizData?.passingScore;
        let passStatus = "failed"

        // to track the user quiz attempts
        const userDoc = await db.collection("users").doc(uid).get();
        const attempts = userDoc.data()?.attemptedQuizes?.[quizId]?.attemptCount || 0;

        if (attempts >= quizData?.maxAttempts) {
            return res.status(403).json({ message: "Max attempts reached" });
        }

        const quizQuestions: string[] = quizData?.questions || [];
        const questionRefs = quizQuestions.map((qid: string) =>
            db.collection("questions").doc(qid)
        );

        const questionDocs = await db.getAll(...questionRefs);

        const correctAnswers = questionDocs
            .filter(doc => doc.exists)
            .map(doc => ({
                questionId: doc.id,
                correctOption: doc.data()?.correctOption,
                explanation: doc.data()?.explanation
            }));

        const selectedOptionsMap = new Map(
            body.options.map((option: any) => [option.questionId, option.selectedOption])
        );

        const resultArray = correctAnswers.map(answer => {
            const selectedOption = selectedOptionsMap.get(answer.questionId) ?? null;

            const isCorrect =
                selectedOption !== undefined &&
                selectedOption === answer.correctOption;

            if (isCorrect) {
                return {
                    questionId: answer.questionId,
                    selectedOption,
                    correctOption: answer.correctOption,
                    isCorrect
                };
            } else {
                return {
                    questionId: answer.questionId,
                    selectedOption,
                    correctOption: answer.correctOption,
                    isCorrect,
                    explanation: answer.explanation
                };
            }

        });
        let score = 0;
        resultArray.filter((doc) => {
            if (doc.isCorrect === true) {
                score++;
            }
        })

        if (score >= passingScore) {
            passStatus = "passed"
        }

        const quizSubmissionDoc = {
            takerId: uid,
            quizId,
            attemptedAt: new Date(),
            score: score,
            result: resultArray,
            status: passStatus

        }

        const submissionResponse = await db.collection("quizSubmission").add(quizSubmissionDoc)
        const submissionId = submissionResponse.id

        await db
            .collection("users")
            .doc(uid)
            .set(
                {
                    attemptedQuizes: {
                        [quizId]: {
                            attemptCount: FieldValue.increment(1),
                            submissionIds: FieldValue.arrayUnion(submissionId)
                        }
                    }
                },
                { merge: true }
            );


        return {
            submissionId,
            options: body.options
        }
    }

    async getResult(quizId: string, uid: string, submissionId: string) {
        const quizSubmissionSnapshot = await db.collection("quizSubmission").doc(submissionId).get()
        const quizSubmissionData = quizSubmissionSnapshot.data()

        const responseData = {
            score: quizSubmissionData?.score,
            status: quizSubmissionData?.status,
            result: quizSubmissionData?.result
        }

        return responseData
    }
}