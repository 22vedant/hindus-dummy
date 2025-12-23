import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin, quizCreateBodyChecker, quizQuestionsCreateChecker, userAuthMiddleware } from "../../../middleware.js";
import type { authMiddlewareInfoRequest } from "../../../lib/types/index.js";
import { db } from "../../../lib/firebase.js";

const quizRouter = Router()

quizRouter.get('/', (req, res) => {
    // #swagger.tags = ['Quiz']
    return res.json({
        message: "inside quiz Router"
    })
})

quizRouter.post('/create', userAuthMiddleware, isAdmin, quizCreateBodyChecker, async (req: authMiddlewareInfoRequest, res) => {
    // #swagger.tags = ['Quiz']
    /* #swagger.security = [{
       "bearerAuth": []
  }] 
   #swagger.summary = 'Create Quiz'
   #swagger.description = 'An API route to create a new quiz'
   #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: {
                      $ref: "#/components/schemas/CreateQuizBody"
                  },
                  
              }
          }
      }
    #swagger.responses[200] = {
            description: "Some description...",
            content: {
                "application/json": {
                    schema:{
                        $ref: "#/components/schemas/User"
                    }
                }           
            }
        }
            
  */
    try {

        const uid = req.uid;
        const body = req.body;

        const quizSize = body.numberOfQuestions;

        // Fetch all questions
        const questionSnapshot = await db.collection("questions").get();
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
            questions: refinedQuestionIdArray,
            attempts: 0
        };

        const quizSnapshot = await db.collection("quiz").add(quizDoc);
        return res.status(200).json({
            message: "Quiz created successfully",
            status_code: 200,
            quizId: quizSnapshot.id
        });

    } catch (error: any) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
});

quizRouter.post("/questions/create", userAuthMiddleware, isAdmin, quizQuestionsCreateChecker, async (req: authMiddlewareInfoRequest, res: Response) => {
    // #swagger.tags = ['Quiz']
    /* #swagger.security = [{
   "bearerAuth": []
}] 
#swagger.summary = 'Create Quiz Questions'
#swagger.description = 'An API route to create questions required for quiz. Only one questions is allowed in each query'
#swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  $ref: "#/components/schemas/CreateQuizQuestions"
              },
              
          }
      }
  }
#swagger.responses[200] = {
        description: "Some description...",
        content: {
            "application/json": {
                schema:{
                    $ref: "#/components/schemas/User"
                }
            }           
        }
    }
        
*/
    try {
        const uid = req.uid as string;
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

        await db.collection("questions").add(questionsDoc)
        return res.status(200).json({
            message: "Questions added successfully"
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error.message
        })
    }
})

quizRouter.post(
    "/submit",
    userAuthMiddleware,
    async (req: authMiddlewareInfoRequest, res) => {
        try {
            // #swagger.tags = ['Quiz']
            /* #swagger.security = [{
            "bearerAuth": []
            }] 
            #swagger.summary = 'Create Quiz Questions'
            #swagger.description = 'An API route to create questions required for quiz. Only one questions is allowed in each query'
            #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: {
                          $ref: "#/components/schemas/SubmitQuizBody"
                      },
                      
                  }
              }
            }
            #swagger.responses[200] = {
                description: "Some description...",
                content: {
                    "application/json": {
                        schema:{
                            $ref: "#/components/schemas/User"
                        }
                    }           
                }
            }
            #swagger.parameters['quizId'] = {
            in: 'query',
            description: 'The quizId of quiz being submitted',
            required: true,
            example: '123'
            }
                
            */
            const quizId = req.query.quizId as string;
            const uid = req.uid

            // if (req.body['options']) {
            //     return res.status(400).json({
            //         message: "Body cannot be empty"
            //     })
            // }

            console.log(req.body.options);

            if (!quizId) {
                return res.status(400).json({ message: "Quiz Id is missing" });
            }

            const quizSnapshot = await db
                .collection("quiz")
                .doc(quizId)
                .get();

            if (!quizSnapshot.exists) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const quizData = quizSnapshot.data();
            const passingScore = quizData?.passingScore;
            let passStatus = "failed"
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
                req.body.options.map((o: any) => [o.questionId, o.selectedOption])
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
                // selectedOptions: req.body.options!,
                attemptedAt: new Date(),
                score: score,
                result: resultArray,
                status: passStatus

            }

            const userDoc = await db.collection("users").doc(uid!).get();
            const attempts = userDoc.data()?.attemptedQuizes?.[quizId]?.attemptCount || 0;
            if (attempts >= quizData?.maxAttempts) {
                return res.status(403).json({ message: "Max attempts reached" });
            }

            const submissionResponse = await db.collection("quizSubmission").add(quizSubmissionDoc)
            const submissionId = submissionResponse.id

            await db
                .collection("users")
                .doc(uid!)
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

            return res.status(200).json({
                message: "Submitted Successfully",
                options: req.body.options,
                submissionId
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
);


quizRouter.get("/result", userAuthMiddleware, async (req: authMiddlewareInfoRequest, res: Response) => {
    // #swagger.tags = ['Quiz']
    /* #swagger.security = [{
    "bearerAuth": []
    }] 
    #swagger.summary = 'Get Quiz Results'
    #swagger.description = 'An API route to fetch quiz results'
    
    #swagger.responses[200] = {
        description: "Some description...",
        content: {
            "application/json": {
                schema:{
                    $ref: "#/components/schemas/User"
                }
            }           
        }
    }

    #swagger.parameters['quizId'] = {
        in: 'query',
        description: 'The quizId of the attempted quiz',
        required: true,
        example: '123'
    }

    #swagger.parameters['submissionId'] = {
        in: 'query',
        description: 'The submissionId of the attempted quiz',
        required: true,
        example: '123'
    }
        
    */
    try {
        const quizId = req.query.quizId as string;
        const submissionId = req.query.submissionId as string
        const uid = req.uid

        if (!quizId || !submissionId) {
            return res.status(400).json({ message: "Missing Credentials" });
        }

        const quizSubmissionSnapshot = await db.collection("quizSubmission").doc(submissionId).get()
        const quizSubmissionData = quizSubmissionSnapshot.data()

        if (quizSubmissionData?.quizId !== quizId) {
            return res.status(400).json({
                message: "The supplied Quiz Id is incorrect"
            })
        }

        const responseData = {
            score: quizSubmissionData?.score,
            status: quizSubmissionData?.status,
            result: quizSubmissionData?.result
        }


        return res.status(200).json({
            responseData
        })


    } catch (error) {
        return res.status(500).json({
            error
        })
    }
})

export default quizRouter