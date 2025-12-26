import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
const contentRouter = Router({ mergeParams: true });
import multer, { memoryStorage } from "multer";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
import { FieldValue, getFirestore, type DocumentData } from "firebase-admin/firestore";
import { isAdmin } from "@/middlewares/isAdmin.ts";
import { userAuthMiddleware } from "@/middlewares/userAuth.ts";
import { apiKeyChecker } from "@/middlewares/apiKeyChecker.ts";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.ts";
import { db } from "@/lib/firebase.ts";
dotenv.config();
const upload = multer({ storage: memoryStorage() });

contentRouter.get("/", (req, res) => {
  // #swagger.tags = ['Content']
  // #swagger.summary = 'Test Content'
  // #swagger.description = 'An API route to test content route'

  res.json({
    message: "inside content route",
  });
});

contentRouter.post("/create", userAuthMiddleware, apiKeyChecker, isAdmin,
  upload.single("file"),
  async (req: authMiddlewareInfoRequest, res: Response) => {
    try {
      // #swagger.tags = ['Content']
      /* #swagger.security = [{
           "bearerAuth": []
      }] 
       #swagger.summary = 'Create Content'
       #swagger.description = 'An API route to create content - Uploads a file, stores it in Firebase Storage, and creates a content record in Firestore.'
       #swagger.requestBody = {
              required: true,
              content: {
                  "multipart/form-data": {
                      schema: {
                          $ref: "#/components/schemas/CreateContentBody"
                      },
                      
                  }
              }
          } 
      */

      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const uid = req.uid;

      const filename = `h-dummy-files/${Date.now()}-${req.file.originalname}`;
      const blob = getStorage().bucket().file(filename);

      const stream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on("error", (err) => {
        console.error(err);
        return res.status(500).send("Upload failed");
      });

      stream.on("finish", async () => {
        let publicUrl;
        // if (process.env.NODE_ENV === 'development') {
        //   publicUrl = `http://127.0.0.1:9199/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
        // } else {
        publicUrl = `https://empdata-bf69b.appspot.com/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}`
        // }

        const contentRecord = {
          title: req.body.title ?? "",
          description: req.body.description ?? "",
          language: req.body.language ?? "",
          thumbnailUrlLink: publicUrl,
          createdBy: uid,
          updatedBy: uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: req.body.type ?? "",
          hidden: req.body.hidden as boolean ?? false,
        };

        const contentRef = await db.collection("content").add(contentRecord);
        await db.collection("users").doc(uid!).update({
          owns: FieldValue.arrayUnion(contentRef.id)
        })

        const contentId = contentRef.id

        return res.status(200).json({
          message: "Uploaded & stored successfully",
          url: publicUrl,
          filename,
          uid,
          contentId
        });
      });

      stream.end(req.file.buffer);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },
);

// update-content route
contentRouter.post("/update", userAuthMiddleware, isAdmin, async (req: authMiddlewareInfoRequest, res: Response) => {
  // #swagger.tags = ['Content']
  /* #swagger.security = [{
       "bearerAuth": []
  }] 
   #swagger.summary = 'Update Content'
   #swagger.description = 'An API route to update content.'
   #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: {
                      $ref: "#/components/schemas/UpdateContentBody"
                  },
                  
              }
          }
      }
    #swagger.responses[200] = {
            description: "Some description...",
            content: {
                "application/json": {
                    schema:{
                        $ref: "#/components/schemas/User"
                    }
                }           
            }
        }    
  */
  try {
    const contentId = req.query.contentid as string
    const uid = req.uid as string
    console.log(uid);

    const body = req.body
    if (body === null) {
      return res.status(400).json({
        message: "Body cannot be empty when trying to update records"
      })
    }

    const userSnapshot = (await db.collection("users").doc(uid)?.get())?.data()

    const ownedContentIds: string[] = Object.values(userSnapshot!['owns']) ?? []

    if (!ownedContentIds.includes(contentId)) {
      return res.status(404).json({
        message: "Content document not found"
      })
    } else {
      const newBody = {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: uid
      }
      const updateResponse = await db.collection("content")?.doc(contentId)?.update(newBody)
      return res.status(200).json({
        message: "Updated successfully"
      })
    }

  } catch (err: unknown) {
    console.error(err);
    res.status(500).json(err);
  }
});

//update-image route
contentRouter.post("/update/image", upload.single("file"), async (req: Request, res: Response) => {
  // #swagger.tags = ['Content']
  /* #swagger.security = [{
       "bearerAuth": []
  }] 
   #swagger.summary = 'Update Image'
   #swagger.description = 'An API route to add a new image in Firebase Storage, and change the thumbnailUrlLink in content collection.'
   #swagger.requestBody = {
          required: true,
          content: {
              "multipart/form-data": {
                  schema: {
                      $ref: "#/components/schemas/UpdateImageBody"
                  },
                  
              }
          }
      }
    #swagger.responses[200] = {
            description: "Some description...",
            content: {
                "application/json": {
                    schema:{
                        $ref: "#/components/schemas/User"
                    }
                }           
            }
        }
            
     #swagger.parameters['contentId'] = {
        in: 'query',
        description: 'The contentId of the content being updated',
        required: true,
}
  */
  try {
    const authHeader = req.get("authorization");
    const contentId = req.query.contentId as string

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Missing or invalid token");
    }
    const token = authHeader.split(" ")[1];
    const decoded = await getAuth().verifyIdToken(token!);
    const uid = decoded.uid;

    const filename = `h-dummy-files/${Date.now()}-${req.file?.originalname}`;
    const blob = getStorage().bucket().file(filename);

    const stream = blob.createWriteStream({
      metadata: {
        contentType: req.file!.mimetype,
      },
    });

    stream.on("error", (err) => {
      return res.status(500).send("Upload failed");
    });

    stream.on("finish", async () => {
      let publicUrl;
      publicUrl = `https://empdata-bf69b.appspot.com/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}`

      await db.collection("content")?.doc(contentId)?.update({
        thumbnailUrlLink: publicUrl
      })

      return res.status(200).json({
        message: "Uploaded & stored successfully",
        url: publicUrl,
        filename,
        uid,
        contentId
      });
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).send(err.message);
  }
})

contentRouter.get("/data", userAuthMiddleware, async (req: authMiddlewareInfoRequest, res: Response) => {
  // #swagger.tags = ['Content']
  /* #swagger.security = [{
      "bearerAuth": []
  }] */

  /* #swagger.parameters['type'] = {
      in: 'query',
      description: 'Type of content to filter',
      required: true,
      example: 'educational'
  } */

  /* #swagger.parameters['hidden'] = {
      in: 'query',
      description: 'Whether hidden content should be included',
      required: true,
      example: 'false'
  } */

  /* #swagger.parameters['language'] = {
      in: 'query',
      description: 'Language of the content',
      required: true,
      example: 'english'
  } */

  try {
    const type = req.query.type;
    const hiddenOrNot = req.query.hidden
    const language = req.query.language

    const uid = req.uid;

    const contentRef = db.collection("content")
    const contentSnapshot = await contentRef
      .where('type', '==', type)
      .where('hidden', '==', hiddenOrNot)
      .where('language', '==', language)
      .orderBy('createdAt')
      .get()

    const contentArray: DocumentData = []

    contentSnapshot.forEach(doc => {
      contentArray.push(doc.data())
    });
    if (contentArray.length === 0) {
      return res.json({
        message: "Records Not Found",
        status: 404,
      })
    }

    return res.status(200).json({
      message: "Ok",
      status: 200,
      data: contentArray,
    })

  } catch (error) {
    return res.status(500).json({
      message: error
    })
  }

})

export default contentRouter;
