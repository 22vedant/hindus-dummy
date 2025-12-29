// src/controllers/content.controller.test.ts
import { jest } from "@jest/globals";

jest.mock('@/services/content.service.ts', () => {
    return {
        ContentService: jest.fn().mockImplementation(() => ({
            createContent: jest.fn(),
            getData: jest.fn(),
            updateContent: jest.fn(),
        })),
    };
});

const { createContent } = await import('@/controllers/content.controller.ts');
const mockedServiceModule = await import('@/services/content.service.ts');
const MockedContentService = mockedServiceModule.ContentService as jest.Mock;

const makeRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe('createContent controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('responds 200 with upload info when file is present', async () => {
        // Get the mock instance that was created when the controller was imported
        const mockInstance = MockedContentService.mock.results[0]?.value;

        mockInstance.createContent.mockResolvedValueOnce({
            publicUrl: 'http://public.url/file.jpg',
            fileName: 'file.jpg',
            contentId: 'content-123',
        });

        const req: any = {
            uid: 'user-uid-1',
            body: { title: 'Test' },
            file: { originalname: 'file.jpg', buffer: Buffer.from('data') },
        };
        const res = makeRes();
        const next = jest.fn();

        await createContent(req, res, next);

        expect(mockInstance.createContent).toHaveBeenCalledWith(
            'user-uid-1',
            { title: 'Test' },
            { originalname: 'file.jpg', buffer: expect.any(Buffer) }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Uploaded & stored successfully",
            url: 'http://public.url/file.jpg',
            fileName: 'file.jpg',
            uid: 'user-uid-1',
            contentId: 'content-123'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('responds 400 when no file uploaded', async () => {
        const req: any = {
            uid: 'user-uid-2',
            body: { title: 'NoFile' },
            file: undefined,
        };
        const res = makeRes();
        const next = jest.fn();

        await createContent(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("No file uploaded.");
        expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when service throws', async () => {
        const mockInstance = MockedContentService.mock.results[0]?.value;
        const err = new Error('service failure');

        mockInstance.createContent.mockRejectedValueOnce(err);

        const req: any = {
            uid: 'user-uid-3',
            body: { title: 'Err' },
            file: { originalname: 'file.jpg', buffer: Buffer.from('data') },
        };
        const res = makeRes();
        const next = jest.fn();

        await createContent(req, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });
});