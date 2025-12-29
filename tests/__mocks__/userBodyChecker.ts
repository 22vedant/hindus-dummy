import { jest } from "@jest/globals";

export async function userBodyChecker() {
    await jest.unstable_mockModule('@/middlewares/userBodyChecker.ts', () => ({
        userCreationBodyChecker: jest.fn(async (req: any, _res: any, next: any) => {
            next();
        }),
    }));

}
