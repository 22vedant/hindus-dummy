import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
const contentRouter = Router({ mergeParams: true });
import multer, { memoryStorage } from "multer";
import { getStorage } from "firebase-admin/storage";
import { type DocumentData } from "firebase-admin/firestore";
import { isAdmin } from "@/middlewares/isAdmin.ts";
import { userAuthMiddleware } from "@/middlewares/userAuth.ts";
import { apiKeyChecker } from "@/middlewares/apiKeyChecker.ts";
import type { authMiddlewareInfoRequest } from "@/lib/types/index.ts";
import { db } from "@/lib/firebase.ts";
import { createContentSchema } from "@/validators/content.validator.ts";
import { validate } from "@/middlewares/validate.ts";
import * as contentController from "@/controllers/content.controller.ts"
const upload = multer({ storage: memoryStorage() });

/**
 * @openapi
 * /v1/content/health:
 *   get:
 *     tags:
 *       - Content
 *     produces:
 *       - application/json
 *     responses:
 *       "200":
 *         description: "inside content route"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "inside content route"
 */
contentRouter.get("/health", (req, res) => {
  res.json({
    message: "inside content route",
  });
});

/**
 * @openapi
 * /v1/content/create:
 *   post:
 *     tags:
 *       - Content
 *     summary: Create Content
 *     description: >
 *       An API route to create content – uploads a file, stores it in
 *       Firebase Storage, and creates a content record in Firestore.
 *
 *       **Requires both headers:**
 *       - Authorization: Bearer JWT
 *       - x-api-key: API key header
 *     security:
 *       - Authorization: []
 *         x-api-key: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateContentBody'
 *     responses:
 *       200:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


contentRouter.post("/create", userAuthMiddleware, apiKeyChecker, isAdmin,
  upload.single("file"),
  validate(createContentSchema),
  contentController.createContent
);

/**
 * @openapi
 * /v1/content/update:
 *   put:
 *     tags:
 *       - Content
 *     summary: Update Content
 *     description: An API route to update content.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContentBody'
 *     responses:
 *       200:
 *         description: Some description...
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

contentRouter.post("/update", userAuthMiddleware, isAdmin, contentController.updateContent);

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

/**
 * @openapi
 * /v1/content/data:
 *   get:
 *     tags:
 *       - Content
 *     summary: Fetch Content
 *     description: Fetch content filtered by type, visibility, and language.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Type of content to filter
 *         required: true
 *         schema:
 *           type: string
 *         example: educational
 *       - name: hidden
 *         in: query
 *         description: Whether hidden content should be included
 *         required: true
 *         schema:
 *           type: boolean
 *         example: false
 *       - name: language
 *         in: query
 *         description: Language of the content
 *         required: true
 *         schema:
 *           type: string
 *         example: english
 *     responses:
 *       200:
 *         description: Content fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request
 */
contentRouter.get("/data", userAuthMiddleware, contentController.getData)

export default contentRouter;
