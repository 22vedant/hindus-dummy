import { db } from "@/lib/firebase.ts";

export class UserModel {
    private collection = db.collection("users")

    async create(userData) {
        await this.collection.add(userData)
    }

    async findUserByEmail(email: string) {
        const userSnapshot = await this.collection.where("email", "==", email).get()
        if (userSnapshot.empty) {
            return null;
        }

    }
}