import { Router, type Request, type Response } from "express";
import { userAuthMiddleware } from "@/middlewares/userAuth.ts";
import type { authMiddlewareInfoRequest, myUserRecord } from "@/lib/types/index.ts";
import * as userController from "@/controllers/users.controller.ts"
import { validate } from "@/middlewares/validate.ts";
import { createUserSchema } from "@/validators/user.validator.ts";

const userRouter = Router();
/**
 * @openapi
 * /v1/users/health:
 *   get:
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       "200":
 *         description: "inside user route"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "inside user route"
 */
userRouter.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
        message: "inside user route",

    });
});

/**
 * @openapi
 * /v1/users/create:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create User
 *     description: An API route to create users on Firebase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBodyRequest'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBodyResponse'
 *             example:
 *               message: User created successfully
 *               uid: 4gxbGh65tjWoHnuCNNpSCH4GjKv2
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: true
 *               message: Bad Request
 *               errorCode: "400"
 */

userRouter.post("/create", validate(createUserSchema), userController.createUser);

/**
 * @openapi
 * /v1/users/fetch:
 *   post:
 *     tags:
 *       - Users
 *     summary: Fetch User Details
 *     description: An API route to fetch user details from Identity platform
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IdGenSchema'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: true
 *               message: Ok
 *               errorCode: "200"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: true
 *               message: Bad Request
 *               errorCode: "400"
 */

userRouter.post('/generateId', userController.generateToken)

// userRouter.use(userAuthMiddleware)

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     Authorization:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
userRouter.delete("/delete", userController.deleteUser);

userRouter.get('/api-key-gen', userAuthMiddleware, userController.generateApiKey)

export default userRouter;
