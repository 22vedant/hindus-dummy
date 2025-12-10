import express from "express";
const app = express();
import contentRouter from "./routes/content/index.js";
import userRouter from "./routes/users/index.js";
import { firebaseApp } from "./lib/firebase.js";

app.use(express.json());
// app.use(firebaseApp);
app.get("/", (req, res) => {
  return res.json({
    message: "ok",
  });
});
app.use("/v1/users", userRouter);
app.use("/v1/content", contentRouter);

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});
