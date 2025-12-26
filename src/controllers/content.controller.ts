import type { Request, Response, NextFunction } from 'express';
import { ContentService } from '@/services/content.service.ts';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';

const model = new ContentService()