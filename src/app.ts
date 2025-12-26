import express from "express";
export const app = express();
import { apiReference } from '@scalar/express-api-reference'
import { firebaseApp } from "./lib/firebase.ts";
import path from "path"
import { fileURLToPath } from "url";
import { v1Router } from "./routes/v1/v1.index.ts";
import { v2Router } from "./routes/v2/v2.index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

firebaseApp
app.use(express.json());

app.use(
  "/swagger",
  express.static(path.join(__dirname, "lib"))
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

