import request from "supertest";
import { app } from "../src/app.js";

describe("GET /health", () => {
    it("should return ok", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
    });
});
