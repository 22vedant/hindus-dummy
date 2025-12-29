import { jest } from "@jest/globals";

/**
 * 1️⃣ Mock the module FIRST
 */
await jest.unstable_mockModule("@/services/content.service.ts", () => ({
    ContentService: jest.fn().mockImplementation(() => ({
        createContent: jest.fn()
    }))
}));

/**
 * 2️⃣ Import AFTER mock
 */
const { createContent } = await import("@/controllers/content.controller.ts");
const { ContentService } = await import("@/services/content.service.ts");

describe("Content Controller - createContent", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should upload content and return 200", async () => {
        const req: any = {
            uid: "user-123",
            body: { title: "Test" },
            file: {
                originalname: "test.png",
                mimetype: "image/png",
                buffer: Buffer.from("test")
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // 👇 Access the mocked instance
        const serviceInstance = (ContentService as jest.Mock).mock.results[0];

        serviceInstance.createContent.mockResolvedValue({
            contentId: "content-123",
            publicUrl: "http://localhost/file.png",
            fileName: "h-dummy-files/test.png"
        });

        await createContent(req, res as any, jest.fn());

        expect(serviceInstance.createContent).toHaveBeenCalledWith(
            "user-123",
            req.body,
            req.file
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
    });
});
