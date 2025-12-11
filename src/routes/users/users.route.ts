import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.json({
    message: "inside content route",
  });
});

userRouter.post("/create", async (req, res) => {
  const {
    email,
    emailVerified,
    phoneNumber,
    password,
    displayName,
    disabled,
    role
  } = req.body;

  const userRecord = await getAuth().createUser({
    email,
    emailVerified,
    phoneNumber,
    password,
    displayName,
    // photoURL: "",
    disabled,
  });

  const userDoc = {
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.displayName ?? null,
    role,
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

userRouter.delete("/delete", async (req, res) => {
  // const body = req.body();
  const token = req.header("Authorization");

  const userStatus = await getAuth().verifyIdToken(token!);
  const uid = userStatus.uid;
  const response = await getAuth().deleteUser(uid);

  getFirestore().collection("users").doc(uid).delete();
  res.json({
    message: "inside content route",
    userStatus,
    response,
  });
});

//user update

export default userRouter;
