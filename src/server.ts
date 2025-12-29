import { app } from "./app.ts";
import dotenv from "dotenv"
dotenv.config()

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
