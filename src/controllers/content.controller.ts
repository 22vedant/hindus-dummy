import type { Request, Response, NextFunction } from 'express';
import { ContentService } from '@/services/content.service.ts';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';

const contentService = new ContentService()

export const createContent = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const uid = req.uid as string;
      const body = req.body;
      const file = req.file;

      const result = await contentService.createContent(uid, body, file);

      return res.status(200).json({
        message: "Uploaded & stored successfully",
        url: result.publicUrl,
        fileName: result.fileName,
        uid,
        contentId: result?.contentId,
      });
    } catch (error) {
        next(error)
    }
}

export const getData = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as string;
        const hiddenOrNot = req.query.hidden as string
        const language = req.query.language as string

        const uid = req.uid;

        const response = await contentService.getData(type, hiddenOrNot, language)

        if (response.length === 0) {
            return res.json({
                message: "Records Not Found",
                status: 404,
            })
        }

        return res.status(200).json({
            message: "Ok",
            status: 200,
            data: response,
        })
    } catch (error) {
        next(error)
    }
}

export const updateContent = async (
    req: authMiddlewareInfoRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const contentId = req.query.contentid as string;
        const uid = req.uid as string;
        const body = req.body;

        if (!contentId) {
            return res.status(400).json({ message: "contentid is required" });
        }

        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({
                message: "Body cannot be empty when trying to update records",
            });
        }

        await contentService.updateContent({
            uid,
            contentId,
            body,
        });

        return res.status(200).json({
            message: "Updated successfully",
        });
    } catch (error) {
        next(error);
    }
};