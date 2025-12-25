import { Router, type Request, type Response } from "express";
import contentRouter from "./routes/content/content.route.ts";
import quizRouter from "./routes/quiz/quiz.route.ts";
import userRouter from "./routes/users/users.route.ts";

export const v1Router = Router();

v1Router.use('/content', contentRouter)
v1Router.use('/users', userRouter)
v1Router.use('/quiz', quizRouter)