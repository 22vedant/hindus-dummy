import { jest } from "@jest/globals";

export async function mockAuth() {
    await jest.unstable_mockModule('@/middlewares/userAuth.ts', () => ({
        userAuthMiddleware: jest.fn(async (req: any, _res: any, next: any) => {
            req.uid = 'ynJQt9IBX0jeefUJCUVT7M3zATLi';
            next();
        }),
    }));

    await jest.unstable_mockModule('firebase-admin/auth', () => ({
        getAuth: jest.fn(() => ({
            verifyIdToken: jest.fn(() =>
                Promise.resolve({
                    sub: '1yKpLXGYxf1ZqTAgQz2sN0uGvibx',
                    email: 'vedant.chinta@zingworks.co',
                })
            ),
        })),
    }));

}
