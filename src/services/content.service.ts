import { db } from "@/lib/firebase.ts"

export class ContentService {
    private collection = db.collection("content")

    async getContentSnapshot(uid: string) {
        const contentSnapshot = await this.collection.doc(uid).get()
        if (!contentSnapshot.exists) return null

        return {
            uid,
            ...contentSnapshot?.data()
        }
    }

    async uploadImage() { }

    async add() { }

    async update() { }

    async delete() { }

    async updateImage() { }

    async getData() { }

}