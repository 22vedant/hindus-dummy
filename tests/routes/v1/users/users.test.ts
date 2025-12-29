import request from "supertest"
import { jest } from "@jest/globals"
import { mockAuth } from "../../../__mocks__/authMock.ts";
import { userBodyChecker } from "../../../__mocks__/userBodyChecker.ts"
await mockAuth()
await userBodyChecker()

const { app } = await import("@/app.ts");

// describe('Create a User in Firebase', () => {
//     it('POST /create', async () => {

//         const phoneNumber = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`

//         const response = await request(app)
//             .post('/v1/users/create')
//             .send({
//                 email: `${Date.now()}@test.com`,
//                 password: 'password',
//                 displayName: 'John Doe',
//                 role: 'ADMIN',
//                 phoneNumber,
//                 subscribedTo: ['daily', 'educational']
//             })

//         console.log(response.body);
//         expect(response.status).toBe(201)
//         expect(response.body.uid).toBeDefined()
//         expect(response.body).not.toBe(null)
//         expect(response.body.message).toBe("User created successfully")

//     })
// })


// describe('Generate API key', () => {
//     it('GET /v1/users/api-key-gen to create a users in firestore', async () => {
//         const response = await request(app)
//             .get('/v1/users/api-key-gen')
//             .set('Authorization', 'Bearer mock-token')

//         expect(response.status).toBe(200)
//         expect(response.body?.apiKey).not.toBeNull()
//         expect(typeof response.body?.apiKey).toBe("string")
//     })
// })

describe('Delete User from Firebase', () => {
    it('DELETE /delete', async () => {
        const response = await request(app)
            .delete('/v1/users/delete')
            .set('Authorization', 'Bearer mock-token')

        console.log(response.body);
        expect(response.status).toBe(200)
        expect(response.body.message).toBe("User deleted successfully")
    })
})