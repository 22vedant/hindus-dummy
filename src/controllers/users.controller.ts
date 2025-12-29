import type { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/users.service.ts';
import type { authMiddlewareInfoRequest } from '@/lib/types/index.ts';
import { UserModel } from '@/models/users.model.ts';
const userService = new UserService()


export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userModel = new UserModel(req.body)
        const uid = await userService.createUser(userModel)
        if (!uid) return res.status(404).json({ message: 'Not found' });

        return res.status(201).json({
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
        // const uid = "KYSsDN5NOa4noPie3YmkFv17ytXm";
        const response = await userService.generateApiKey(uid)

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
        const response = await userService.deleteUser(uid)

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
        const response = await userService.generateToken(body)

        return res.status(200).json({
            message: "Token generated successfully",
            response
        })
    } catch (error) {
        next(error)
    }
}