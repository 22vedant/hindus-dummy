import express from "express";
const app = express();
import { apiReference } from '@scalar/express-api-reference'

import contentRouter from "./routes/content/content.route.js";
import userRouter from "./routes/users/users.route.js";
import quizRouter from "./routes/quiz/quiz.route.js";
import { firebaseApp } from "./lib/firebase.js";
import * as swaggerDoc from "./swagger-output.json" with { type: "json" }
import path from "path"
import { fileURLToPath } from "url";
const PORT = Number(process.env.PORT) || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

firebaseApp
app.use(express.json());

app.use(
  "/swagger",
  express.static(path.join(__dirname))
);
app.use('/reference', apiReference({
  url: "/swagger/swagger-output.json",
  hideDarkModeToggle: true,
  theme: 'deepSpace',
  title: 'Hindus R Us Api',
  slug: 'hindus-r-us-api',
  layout: "classic",
  showDeveloperTools: "never"
}))

app.use("/v1/users", userRouter);
app.use("/v1/content", contentRouter);
app.use('/v1/quiz', quizRouter)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
