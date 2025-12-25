import request from "supertest";
import { app } from "../src/app.ts";

describe('Test', () => {
    it('GET /v1/asd should test the asd route', async () => {
        const response = await request(app).get('/v1/users/asd');
        expect(response.status).toBe(200)
        // expect(Array.isArray(response.body)).toBe(true);
        console.log(response.body)

    })
})