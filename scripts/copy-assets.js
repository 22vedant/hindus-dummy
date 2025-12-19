import { cp } from "node:fs/promises";

await cp("index.html", "dist/index.html");
