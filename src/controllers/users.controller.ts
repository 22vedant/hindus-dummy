import type { Request, Response, NextFunction } from 'express';
import { UserModel } from '@/services/users.service.ts';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';

const model = new UserModel()

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body
        const uid = await model.createUser(body)
        if (!uid) return res.status(404).json({ message: 'Not found' });

        return res.status(200).json({
            message: "User created successfully",
            uid: uid
        })
    } catch (error) {
        next(error)
    }
}

export const generateApiKey = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.uid as string
        const response = await model.generateApiKey(uid)

        if (!uid) return res.status(404).json({
            message: "User not found"
        })

        if (!response) return res.status(400).json({
            message: "Please contact support."
        })

        return res.status(200).json({
            message: "Api generated successfully",
            apiKey: response
        })
    } catch (error) {
        next(error)
    }

}

export const deleteUser = async (req: authMiddlewareInfoRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.uid as string
        const response = await model.deleteUser(uid)

        return res.status(200).json({
            message: "User deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const response = await model.generateToken(body)

        return res.status(200).json({
            message: "Token generated successfully",
            response
        })
    } catch (error) {
        next(error)
    }
}