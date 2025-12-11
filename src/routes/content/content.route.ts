import { Router, type Request, type Response } from "express";
import { getAuth } from "firebase-admin/auth";
const contentRouter = Router({ mergeParams: true });
import multer, { memoryStorage } from "multer";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
import { FieldValue, getFirestore, type DocumentData } from "firebase-admin/firestore";
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

contentRouter.post("/create",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).send("Missing or invalid token");
      }

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
        let publicUrl;
        if (process.env.NODE_ENV === 'development') {
          publicUrl = `http://127.0.0.1:9199/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
        } else {
          publicUrl = `https://firebasestorage.googleapis.com/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}?alt=media`
        }


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

        const contentRef = await getFirestore().collection("content").add(contentRecord);
        await getFirestore().collection("users").doc(uid).update({
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
contentRouter.post("/update/:contentid", async (req: Request, res: Response) => {
  try {
    const authHeader = req.get("authorization");
    const contentId = req.params.contentid
    console.log(contentId);

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Missing or invalid token");
    }
    const token = authHeader.split(" ")[1];
    const decoded = await getAuth().verifyIdToken(token!);
    const uid = decoded.uid;
    console.log(uid);

    const body = req.body

    console.log(body);


    const userSnapshot = (await getFirestore().collection("users").doc(uid)?.get())?.data()

    // if (!userSnapshot?.exists) {
    //   return res.status(404).send("User not found")
    // }

    const ownedContentIds: string[] = Object.values(userSnapshot!['owns']) ?? []

    if (!ownedContentIds.includes(contentId!)) {
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
      const updateResponse = await getFirestore().collection("content")?.doc(contentId!)?.update(newBody)
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
contentRouter.post("/update/image/:contentid", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const authHeader = req.get("authorization");
    const contentId = req.params.contentid
    console.log(contentId);

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Missing or invalid token");
    }
    const token = authHeader.split(" ")[1];
    const decoded = await getAuth().verifyIdToken(token!);
    const uid = decoded.uid;
    console.log(uid);

    const filename = Date.now() + "-" + req.file?.originalname;
    console.log(filename);

    const blob = getStorage().bucket().file(filename);

    const stream = blob.createWriteStream({
      metadata: {
        contentType: req.file!.mimetype,
      },
    });
    console.log(blob.bucket.name)
    console.log(stream);


    stream.on("error", (err) => {
      console.error(err);
      return res.status(500).send("Upload failed");
    });

    stream.on("finish", async () => {
      const publicUrl = `http://127.0.0.1:9199/v0/b/${blob.bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
      console.log(publicUrl);

      await getFirestore().collection("content")?.doc(contentId!)?.update({
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

contentRouter.get("/data", async (req: Request, res: Response) => {
  try {
    const type = req.query.type;
    const hiddenOrNot = req.query.hidden
    const language = req.query.language

    console.log(type);
    console.log(hiddenOrNot);


    const authHeader = req.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Missing or invalid token");
    }

    const token = authHeader.split(" ")[1];
    const decoded = await getAuth().verifyIdToken(token!);
    const uid = decoded.uid;

    const contentRef = getFirestore().collection("content")
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
