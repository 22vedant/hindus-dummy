import { db } from "@/lib/firebase.ts";
// types here

// export class UserModel {
//     private collection = db.collection("users")

//     async create(postData) {
//         const userRef = this.collection.doc();
//         const user = {
//             id: userRef.id,
//             ...postData,
//         };

//         await userRef.set(user);
//         return user;
//     }

//     async update() { }
//     async delete() { }

//     // batch delete users.
//     async findUserByEmail(email: string) {
//         const userSnapshot = await this.collection.where("email", "==", email).limit(1).get()
//         if (userSnapshot.empty) {
//             return null;
//         }

//         const doc = userSnapshot.docs[0]
//         return { id: doc.id, ...doc.data() }
//     }
// }

export interface UserModelSchema {
    uid: string
    email: string;
    password?: string;
    emailVerified: boolean;
    displayName: string
    photoUrl?: string
    disabled?: boolean
    phoneNumber?: string
    subscribedTo?: string[]
    role?: string
    owns: string[]
    signInDate: Date
    createdAt: Date,

}

export class UserModel {
    // private static collection = db.collection("users")
    email: string;
    password: string;
    emailVerified: boolean
    displayName: string;
    photoUrl: string
    disabled: boolean
    phoneNumber: string
    subscribedTo: string[];
    role: string;
    owns: string[];

    constructor(data: Partial<UserModelSchema>) {
        this.displayName = data.displayName ?? "";
        this.email = data.email ?? "";
        this.password = data.password ?? ""
        this.disabled = data.disabled ?? false
        this.role = data.role ?? "";
        this.subscribedTo = data.subscribedTo ?? [];
        this.owns = data.owns ?? [""];
        this.emailVerified = data.emailVerified ?? false;
        this.phoneNumber = data.phoneNumber ?? ""
        this.photoUrl = data.photoUrl ?? ""
    }

    // access to firebase.
}

