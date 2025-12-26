import { Router, type Request, type Response } from "express";
import { userAuthMiddleware, userCreationBodyChecker } from "@/middlewares/middleware.ts";
import type { authMiddlewareInfoRequest, myUserRecord } from "@/lib/types/index.ts";
import * as userController from "@/controllers/users.controller.ts"

const userRouter = Router();

// #swagger.tags = ['Users']
userRouter.get("/heatlh", (_req: Request, res: Response) => {
  res.json({
    message: "inside user route",

  });
});

/*
#swagger.tags = ['Users']
#swagger.summary = 'Create User'
#swagger.description = 'An API route to create users on Firebase'
#swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/CreateBodyRequest"
                    },
                }
            }
        } 

#swagger.responses[200] = {
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
userRouter.post("/create", userCreationBodyChecker, userController.createUser);

/* #swagger.tags = ['Users']
  #swagger.summary = 'Fetch User Details'
  #swagger.description = 'An API route to fetch user details from Identity platform'
  #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: {
                          $ref: "#/components/schemas/IdGenSchema"
                      },
                  }
              }
          } 
  #swagger.responses[200] = {
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
userRouter.post('/generateId', userController.generateToken)

userRouter.use(userAuthMiddleware)

/* #swagger.tags = ['Users']
   #swagger.security = [{
           "bearerAuth": []
   }] */
userRouter.delete("/delete", userController.deleteUser);

userRouter.get('/api-key-gen', userController.generateApiKey)

export default userRouter;
