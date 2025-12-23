import { Router, type Request, type Response } from "express";

import dotenv from "dotenv"
dotenv.config()

export const v2Router = Router();

v2Router.get('/asd', (_req, res) => {
    return res.json({
        message: "Hello from v2 route"
    })
})