import { db } from "@/lib/firebase.ts"
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export interface UpdateContentInput {
    uid: string;
    contentId: string;
    body: Record<string, any>;
}

export class ContentService {
    private collection = db.collection("content")

    async createContent(
        uid: string,
        body: any,
        file: Express.Multer.File
    ): Promise<{ contentId: string, publicUrl: string, fileName: string }> {
        const filename = `h-dummy-files/${Date.now()}-${file.originalname}`;
        const bucket = getStorage().bucket();
        const blob = bucket.file(filename);

        return new Promise(async (resolve, reject) => {
            const stream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            stream.on("error", reject);

            stream.on("finish", async () => {
                const publicUrl =
                    process.env.NODE_ENV === "development"
                        ? `http://127.0.0.1:9199/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`
                        : `https://storage.googleapis.com/${bucket.name}/${filename}`;

                const contentRecord = {
                    title: body.title ?? "",
                    description: body.description ?? "",
                    language: body.language ?? "",
                    thumbnailUrlLink: publicUrl,
                    createdBy: uid,
                    updatedBy: uid,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    type: body.type ?? "",
                    hidden: body.hidden ?? false,
                };

                const contentRef = await db.collection("content").add(contentRecord);

                await db.collection("users").doc(uid).update({
                    owns: FieldValue.arrayUnion(contentRef.id),
                });

                resolve({
                    contentId: contentRef.id,
                    publicUrl,
                    fileName: filename,
                });
            });

            stream.end(file.buffer);
        });
    }

    async getData(type: string, hiddenOrNot: string, language: string) {
        const contentSnapshot = await this.collection.where('type', '==', type)
            .where('hidden', '==', hiddenOrNot)
            .where('language', '==', language)
            .orderBy('createdAt')
            .get()

        const contentArray: DocumentData = []
        contentSnapshot.forEach(doc => {
            contentArray.push(doc.data())
        });

        return contentArray
    }

    async updateContent({
        uid,
        contentId,
        body,
    }: UpdateContentInput): Promise<void> {
        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const userData = userDoc.data()!;
        const ownedContentIds: string[] = userData.owns ?? [];

        if (!ownedContentIds.includes(contentId)) {
            const err = new Error("Content document not found");
            (err as any).statusCode = 404;
            throw err;
        }

        const updatePayload = {
            ...body,
            updatedAt: new Date(),
            updatedBy: uid,
        };

        await this.collection.doc(contentId).update(updatePayload);
    }
}

export function createContent(createContent: any) {
    throw new Error("Function not implemented.");
}
