import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
const contentRouter = Router();
import multer, { memoryStorage } from "multer";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
dotenv.config();
const upload = multer({ storage: memoryStorage() });
/**
 * {
   "uid": "string",
   "title": "string",
   "description": "string",
   "language": "string",
   "thumbnail_url_link": "string",
   "createdBy": "string",
   "updatedBy": "string",
   "createdAt": "string",
   "updatedAt": "string",
   // "owner": "uid",
   "type": "string",
   "hidden": false
 },
 */

contentRouter.get("/", (req, res) => {
  res.json({
    message: "inside content route",
  });
});

contentRouter.post(
  "/create",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).send("Missing or invalid token");
      }

      console.log(req.body.title);


      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const token = authHeader.split(" ")[1];
      const decoded = await getAuth().verifyIdToken(token!);
      const uid = decoded.uid;

      const filename = Date.now() + "-" + req.file.originalname;
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
        const publicUrl = `http://127.0.0.1:9199/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;

        const contentRecord = {
          title: req.body.title ?? "",
          description: req.body.description ?? "",
          language: req.body.language ?? "",
          thumbnailUrlLink: publicUrl,
          createdBy: uid,
          updatedBy: uid,
          createdAt: Date.now(), // <-- FIXED (new Date.now() is invalid)
          updatedAt: Date.now(),
          type: req.body.type ?? "",
          hidden: req.body.hidden ?? false,
        };

        await getFirestore().collection("content").add(contentRecord);

        return res.status(200).json({
          message: "Uploaded & stored successfully",
          url: publicUrl,
          filename,
          uid,
        });
      });

      stream.end(req.file.buffer);
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },
);
// update-image route
// contentRouter.post("/update", async (req: Request, res: Response) => {
//   try {
//     const authHeader = req.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return res.status(401).send("Missing or invalid token");
//     }
//     const token = authHeader.split(" ")[1];
//     const decoded = await getAuth().verifyIdToken(token);
//     const uid = decoded.uid;

//     const body = req.body
//   }catch(error) {

//   }

// });
export default contentRouter;
