import { db } from "@/lib/firebase.ts"
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
    signInDate: Date;
    createdAt: Date;
    uid: string


    constructor(data: Partial<UserModelSchema>) {
        this.displayName = data.displayName ?? "";
        this.uid = data.uid ?? ""
        this.email = data.email ?? "";
        this.password = data.password ?? ""
        this.disabled = data.disabled ?? false
        this.role = data.role ?? "";
        this.subscribedTo = data.subscribedTo ?? [];
        this.owns = data.owns ?? [""];
        this.emailVerified = data.emailVerified ?? false;
        this.phoneNumber = data.phoneNumber ?? ""
        this.photoUrl = data.photoUrl ?? ""
        this.signInDate = data.signInDate ?? new Date()
        this.createdAt = data.createdAt ?? new Date()
    }

    // access to firebase.
}

