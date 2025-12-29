import { db } from "@/lib/firebase.ts";

interface UserModelSchema {
    id: string,
    displayName: string,
    email: string,
    password: string,
    role: string,
    subscribedTo: string,
    owns: string[]
}

export class UserModel {
    private collection = db.collection("content")
    private id: string;
    private displayName: string;
    private email: string;
    private password: string;
    private role: string;
    private subscribedTo: string;
    private owns: string[];

    constructor(data: UserModelSchema) {
        this.id = data.id;
        this.displayName = data.displayName;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        this.subscribedTo = data.subscribedTo;
        this.owns = data.owns;
    }

    // access to firebase.
}

