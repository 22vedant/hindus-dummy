import crypto from "crypto"
import { Router, type Request, type Response } from "express";
import { getAuth, UserRecord, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { userAuthMiddleware, userCreationBodyChecker } from "@/middlewares/middleware.ts";
import type { authMiddlewareInfoRequest, myUserRecord } from "@/lib/types/index.ts";
import { db } from "@/lib/firebase.ts";
import dotenv from "dotenv"
import { generateApiKeyV1, generateApiKeyV2 } from "@/lib/utils.ts";
dotenv.config()
const userRouter = Router();

userRouter.get("/asd", (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  res.json({
    message: "inside user route",

  });
});

userRouter.post("/create", userCreationBodyChecker, async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create User'
  // #swagger.description = 'An API route to create users on Firebase'
  /*  #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: {
                          $ref: "#/components/schemas/CreateBodyRequest"
                      },
                  }
              }
          } 
      */
  /* #swagger.responses[200] = {
     description: "Success",
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/ErrorResponse"
             },
             example: {
                success: true,
                message: "Ok",
                errorCode: "200"
             }
         }           
     }
 }   
     #swagger.responses[400] = {
     description: "Bad Request",
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/ErrorResponse"
             },
             example: {
                success: true,
                message: "Bad Request",
                errorCode: "400"
             }
         }           
     }
 }   
*/
  try {
    const body = req.body

    const user: myUserRecord = {
      email: body.email,
      emailVerified: body.emailVerified ?? false,
      password: body.password,
      displayName: body.displayName,
      disabled: body.disabled ?? false,
    }

    if (req.body?.phoneNumber) {
      user.phoneNumber = req.body.phoneNumber
    }

    const userRecord = await getAuth().createUser(user);

    const userDoc = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName ?? null,
      role: body.role,
      photoURL: "",
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber ?? null,
      disabled: userRecord.disabled,
      owns: [],
      subscribedTo: body.subscribedTo,
      signInDate: new Date(),
      createdAt: new Date(),
    };

    getFirestore().collection("users").doc(userRecord.uid).create(userDoc);
    res.json({
      message: "Created successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message
    })
  }
});

userRouter.post('/generateId', async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Fetch User Details'
  // #swagger.description = 'An API route to fetch user details from Identity platform'
  /*  #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: {
                          $ref: "#/components/schemas/IdGenSchema"
                      },
                  }
              }
          } 
      */
  /* #swagger.responses[200] = {
     description: "Success",
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/ErrorResponse"
             },
             example: {
                success: true,
                message: "Ok",
                errorCode: "200"
             }
         }           
     }
 }   
     #swagger.responses[400] = {
     description: "Bad Request",
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/ErrorResponse"
             },
             example: {
                success: true,
                message: "Bad Request",
                errorCode: "400"
             }
         }           
     }
 }   
*/
  try {
    const body = {
      email: req.body.email,
      password: req.body.password,
      returnSecureToken: req.body.returnSecureToken
    }
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    return res.status(200).json({
      message: "success",
      response
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

userRouter.use(userAuthMiddleware)
userRouter.delete("/delete", async (req: authMiddlewareInfoRequest, res: Response) => {
  // #swagger.tags = ['Users']
  /* #swagger.security = [{
           "bearerAuth": []
   }] */
  const uid = req.uid as string
  const response = await getAuth().deleteUser(uid!);
  // console.log(uid);

  await db.collection("users").doc(uid).delete();
  res.json({
    message: "User Deleted Successfully",
    uid: req.uid
    // response,
  });
});

userRouter.get('/api-key-gen', async (req: authMiddlewareInfoRequest, res: Response) => {
  try {
    const uid = req.uid
    const apiVersion = req.query.apiVersion as string
    // const baseApiVersion = (req.baseUrl).toString().slice(2, 3)
    const userRef = await getFirestore().collection("users").doc(uid!)
    const userSnapshot = await userRef.get();
    let apiKey = ""
    if (!userSnapshot.data()?.apiKeyHash) {
      if (apiVersion === '2') {
        apiKey = generateApiKeyV2()
      } else {
        apiKey = generateApiKeyV1()
      }
      const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
      userRef.update({
        apiKeyHash,
        createdAt: new Date()
      })

      return res.status(200).json({
        apiKey
      })
    }

    return res.status(409).json({
      message: "You have already generated an API key. Please contact support to rotate/regenerate the key.",
    })

  } catch (error: any) {
    return res.status(500).json({
      message: error.message
    })
  }

})

export default userRouter;
