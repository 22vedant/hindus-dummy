import express from "express";
const app = express();
import { apiReference } from '@scalar/express-api-reference'

import contentRouter from "./v1/routes/content/content.route.js";
import userRouter from "./v1/routes/users/users.route.js";
import quizRouter from "./v1/routes/quiz/quiz.route.js";
import { firebaseApp } from "./lib/firebase.js";
import * as swaggerDoc from "./lib/swagger-output.json" with { type: "json" }
import path from "path"
import { fileURLToPath } from "url";
import { v1Router } from "./v1/v1.index.ts";
import { v2Router } from "./v2/v2.index.ts";
const PORT = Number(process.env.PORT) || 3000;

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

app.use("/v1", v1Router)
app.use("/v2", v2Router)
// app.use("/v1/users", userRouter);
// app.use("/v1/content", contentRouter);
// app.use('/v1/quiz', quizRouter)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
