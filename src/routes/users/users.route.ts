import { Router, type Request, type Response } from "express";
import { getAuth, UserRecord, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { userAuthMiddleware, userCreationBodyChecker } from "../../middleware.js";
import type { authMiddlewareInfoRequest, myUserRecord } from "../../lib/types/index.js";
import { db } from "../../lib/firebase.js";
import dotenv from "dotenv"
dotenv.config()
const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) => {
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

userRouter.post("/create2", async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create User'
  // #swagger.description = 'An Alternate API route to create users as well as update'
  /*  #swagger.requestBody = {
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
      */
  /* #swagger.responses[200] = {
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
    const auth = getAuth();
    const { email, ...rest } = req.body;

    let user;
    try {
      user = await auth.getUserByEmail(email);
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
      await auth.updateUser(user.uid, rest);

      await db.collection("users").doc(user.uid).set(
        {
          ...rest,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      return res.status(200).json({ message: "User updated successfully" });
    }

    const newUser = await auth.createUser({
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

    await db.collection("users").doc(newUser.uid).set(userDoc);

    return res.json({ message: "User created successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

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

export default userRouter;
