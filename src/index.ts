import express from "express";
const app = express();

import contentRouter from "./routes/content/content.route.ts";
import userRouter from "./routes/users/users.route.ts";
import quizRouter from "./routes/quiz/quiz.route.ts";
import { firebaseApp } from "./lib/firebase.ts";
// import { userAuthMiddleware } from "./middewares/users.middleware.ts"

firebaseApp
app.use(express.json());
// app.use(firebaseApp);
app.get("/", (req, res) => {
  console.log("hello");

  return res.json({
    message: "ok",
  });
});
// app.use(userAuthMiddleware)

app.use("/v1/users", userRouter);
app.use("/v1/content", contentRouter);
app.use('/v1/quiz', quizRouter)

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});
