import { z } from "zod"
import { db } from "@/lib/firebase.ts"
export const createUserSchema = z.object({
    body: z.object({
        email: z.email().refine(async (email) => {
            const exists = await db.collection("users").where("email", "==", email).get()
            return exists.empty
        }, "Email already exists"),
        password: z.string().min(8).max(20),
        displayName: z.string(),
        role: z.enum(['ADMIN', 'USER']),
        subscribedTo: z.array(z.enum(['daily', 'educational']))
    })
})

export const updateUserSchema = z.object({
    body: z.object({
        email: z.email().refine(async (email) => {
            const exists = await db.collection("users").where("email", "==", email).get()
            return exists.empty
        }, "User not found"),
        password: z.string().min(8).max(20),
        displayName: z.string(),
        role: z.enum(['ADMIN', 'USER']),
        subscribedTo: z.enum(['daily', 'educational'])
    }).partial()
})

