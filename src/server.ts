import { app } from "./app.ts";
import { fileURLToPath } from "url";
import dotenv from "dotenv"
import path from "path";
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const joinedPath = path.join(__dirname, '/lib/swagger-output.json')

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    console.log(__filename);
    console.log(__dirname);

    console.log(joinedPath);

});
