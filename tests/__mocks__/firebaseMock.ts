import { jest } from "@jest/globals";

export async function mockFirebaseAuth(uid = "test-uid-123") {
    await jest.unstable_mockModule("firebase-admin/auth", () => ({
        getAuth: () => ({
            verifyIdToken: jest.fn(async () => ({
                uid,
                email: "test@example.com",
                sub: uid,
            })),
        }),
    }));
}
