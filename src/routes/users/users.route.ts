import { Router, type Request, type Response } from "express";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { userAuthMiddleware, userCreationBodyChecker } from "../../middleware.ts";
import type { authMiddlewareInfoRequest } from "../../lib/types/index.ts";

const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) => {
  res.json({
    message: "inside user route",

  });
});

userRouter.post("/create", userCreationBodyChecker, async (req, res) => {
  const body = req.body

  const userRecord = await getAuth().createUser({
    email: body.email,
    emailVerified: body.emailVerified,
    phoneNumber: body.phoneNumber,
    password: body.password,
    displayName: body.displayName,
    // photoURL: "",
    disabled: body.displayName ?? false,
  });

  const userDoc = {
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.displayName ?? null,
    role: body.role,
    photoURL: "",
    emailVerified: userRecord.emailVerified,
    phoneNumber: userRecord.phoneNumber ?? null,
    disabled: userRecord.disabled,
    owns: [],
    subscribedTo: [],
    signInDate: new Date(),
    createdAt: new Date(),
  };

  getFirestore().collection("users").doc(userRecord.uid).create(userDoc);
  res.json({
    message: "Created successfully",
  });
});


userRouter.post("/create2", async (req, res) => {
  try {
    const auth = getAuth();
    const db = getFirestore();
    const { email, ...rest } = req.body;

    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") {
        return res.status(500).send("Error checking user");
      }
      if (err.code == "auth/phone-number-already-exists") {
        return res.status(409).json({
          message: "User already exists for this phone number"
        })
      }
    }

    if (user) {
      await auth.updateUser(user.uid, rest);

      await db.collection("users").doc(user.uid).set(
        {
          ...rest,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      return res.status(200).json({ message: "User updated successfully" });
    }

    const newUser = await auth.createUser({
      email: req.body.email,
      emailVerified: req.body.emailVerified,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      displayName: req.body.displayName,
      disabled: req.body.disabled,
    });

    const userDoc = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName ?? null,
      role: req.body.role,
      photoURL: "",
      emailVerified: newUser.emailVerified,
      phoneNumber: newUser.phoneNumber ?? null,
      disabled: newUser.disabled || false,
      owns: [],
      subscribedTo: [],
      signInDate: new Date(),
      createdAt: new Date(),
    };

    await db.collection("users").doc(newUser.uid).set(userDoc);

    return res.json({ message: "User created successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

userRouter.use(userAuthMiddleware)
userRouter.delete("/delete", async (req: authMiddlewareInfoRequest, res: Response) => {
  const body = req.body();
  const uid = req.uid as string
  const response = await getAuth().deleteUser(uid!);
  // console.log(uid);

  await getFirestore().collection("users").doc(uid).delete();
  res.json({
    message: "User Deleted Successfully",
    uid: req.uid
    // response,
  });
});

export default userRouter;
