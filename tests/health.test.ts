import request from "supertest";
import { app } from "@/app.ts";

describe('Test', () => {
    it('GET /v1/asd should test the asd route', async () => {
        const response = await request(app).get('/v1/users/health');
        expect(response.status).toBe(200)
        // expect(Array.isArray(response.body)).toBe(true);
        // console.log(response.body)

    })
})