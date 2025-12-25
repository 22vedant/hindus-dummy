import { Router } from "express";
import type { Request, Response } from "express";
import type { authMiddlewareInfoRequest } from "../../../lib/types/index.ts";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { generateAccessToken, generateRefreshToken } from "../../../lib/utils.ts";
export const userRouter2 = Router()

// implement this route after firebase client sdk signin. This returns access token and refresh token required for authenticate RBAC. 
userRouter2.post('/auth/login', async (req: Request, res: Response) => {
    // const userRef = await getFirestore().collection("users").where("email", "==", req.body.email).get()
    const userRef = await getAuth().getUserByEmail(req.body.email)

    const accessToken = generateAccessToken({
        email: userRef.email,
        uid: userRef.uid,
        role: "ADMIN"
    })

    const refreshToken = generateRefreshToken({
        uid: userRef.uid
    })


    res.cookie("selfRefreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/auth/refresh"
    })

    return res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    })

})

userRouter2.post("/create", async (req: authMiddlewareInfoRequest, res: Response) => {

    /* #swagger.tags = ['Users']
     #swagger.summary = 'Create User'
     #swagger.description = 'An Alternate API route to create users as well as update'
     #swagger.requestBody = {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/CreateBodyRequest"
                        },
                        example: { 
                          $ref: "#/components/examples/CreateBodyExample"
                      }
                    }
                }
            } 

       #swagger.responses[200] = {
       description: "Success",
       content: {
           "application/json": {
               schema:{
                   $ref: "#/components/schemas/CreateBodyResponse"
               }
           }           
       }
   }   
  */
    try {
        let user;
        try {
            user = await getAuth().getUserByEmail(req.body?.email);
        } catch (err: any) {
            if (err.code !== "auth/user-not-found") {
                return res.status(500).send("Error checking user");
            }
            if (err.code == "auth/phone-number-already-exists") {
                return res.status(409).json({
                    message: "User already exists for this phone number"
                })
            }
        }

        if (user) {
            await getAuth().updateUser(user.uid, ...req.body);

            await getFirestore().collection("users").doc(user.uid).set(
                {
                    ...req.body,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            return res.status(200).json({ message: "User updated successfully" });
        }

        const newUser = await getAuth().createUser({
            email: req.body.email,
            emailVerified: req.body.emailVerified,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            displayName: req.body.displayName,
            disabled: req.body.disabled,
        });

        const userDoc = {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName ?? null,
            role: req.body.role,
            photoURL: "",
            emailVerified: newUser.emailVerified,
            phoneNumber: newUser.phoneNumber ?? null,
            disabled: newUser.disabled || false,
            owns: [],
            subscribedTo: [],
            signInDate: new Date(),
            createdAt: new Date(),
        };

        await getFirestore().collection("users").doc(newUser.uid).set(userDoc);

        return res.json({ message: "User created successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
});