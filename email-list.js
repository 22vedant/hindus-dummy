import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const enableBtn = document.getElementById("enable")
const form = document.getElementById("form")

// const firebaseConfig = {
//     apiKey: "AIzaSyAeT5O6U3ECusxz1eMKskEpqfcatqjiqHo",
//     authDomain: "empdata-bf69b.firebaseapp.com",
//     projectId: "empdata-bf69b",
//     messagingSenderId: "182702284982",
//     appId: "1:182702284982:web:d6a054282774a3a3d00617",
//     measurementId: "G-8JRXWP1C5K"
// };

// const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


const firebaseConfig = {
    apiKey: "fake-api-key",
    authDomain: "localhost",
    projectId: "demo-project",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// 🔥 CONNECT TO EMULATORS (ONLY IN DEV)
if (location.hostname === "localhost") {
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099");
}


if (enableBtn) {
    enableBtn.addEventListener("click", async () => {
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.error("Permission denied");
            return;
        }

        const token = await getToken(messaging, {
            vapidKey: "BEvGL05N5_X9fR12yvw0jWueRw2urddoJmVrw2l02JfMRx9qqR3jt9vl7vtNoGWbI6e1wWNTiiAl_6pniMoEI9Q",
            serviceWorkerRegistration: registration
        });

        console.log("🔥 FCM TOKEN:", token);
    });
}

form.addEventListener("submit", (event) => {
    event.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value



})