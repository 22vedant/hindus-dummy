import { getAuth } from "firebase-admin/auth";


export const userAuthMiddleware = async (req: Request, res: Response, next) => {
    if (req.path === '/create') {
        next()
    } else {
        const token = req.headers.get("Authorization");

        const userStatus = await getAuth().verifyIdToken(token!);
        const uid = userStatus.uid;
    }
}