import { db } from "@/lib/firebase.ts"
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto"
import type { myUserRecord, tokenGen } from "@/lib/types/index.ts"
import { generateApiKeyV1 } from "@/lib/utils.ts";
import axios from "axios";
import type { UserModel, UserModelSchema } from "@/models/users.model.ts";

export class UserService {
    private collection = db.collection("users")

    async createUser(body: UserModel) {
        const user: myUserRecord = {
            email: body.email,
            emailVerified: body.emailVerified ?? false,
            password: body.password,
            displayName: body.displayName,
            disabled: body.disabled ?? false,
        }

        if (body?.phoneNumber) {
            user.phoneNumber = body.phoneNumber
        }

        const userRecord = await getAuth().createUser(user);
        const userDoc: Partial<UserModelSchema> = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName ?? "",
            role: body.role,
            photoUrl: "",
            emailVerified: userRecord.emailVerified,
            phoneNumber: userRecord.phoneNumber ?? "",
            disabled: userRecord.disabled,
            owns: [],
            subscribedTo: body.subscribedTo,
            signInDate: new Date(),
            createdAt: new Date(),
        };
        this.collection.doc(userRecord.uid).create(userDoc);

        return userRecord.uid
    }

    async generateApiKey(uid: string) {
        const userSnapshot = (await this.collection.doc(uid).get())?.data()

        let apiKey: string = ""
        // if (!userSnapshot?.apiKeyHash) {
        apiKey = generateApiKeyV1()
        const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
        const response = await this.collection.doc(uid).update({
            apiKeyHash,
            createdAt: new Date()
        })
        return apiKey
        // }
        // return null
    }

    async deleteUser(uid: string) {
        await getAuth().deleteUser(uid)
        await this.collection.doc(uid).delete()
    }

    async generateToken(body: tokenGen) {
        const { email, password, returnSecureToken } = body
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.MY_API_KEY}`, {
            email,
            password,
            returnSecureToken
        })

        return response;
    }
}