import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { swaggerSpecification } from "./swagger.ts"
import YAML from "yamljs"

const yamlContent = YAML.stringify(swaggerSpecification, 10, 2);


// const outputDir = path.resolve(__dirname, "../src/lib/swagger");
const outputFile = path.join(__dirname, "swagger.yaml");

fs.writeFile(outputFile, yamlContent, "utf8", (err) => {
    if (err) {
        console.error("An error occurred while writing YAML file:", err);
    } else {
        console.log("swagger.yaml saved at:", outputFile);
    }
});