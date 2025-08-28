import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {GoogleAuthProvider} from "@firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuuWFuk8PUNhtDRXD7gJ8T5V2ifWKYpJY",
    authDomain: "uno-score-app.firebaseapp.com",
    projectId: "uno-score-app",
    storageBucket: "uno-score-app.firebasestorage.app",
    messagingSenderId: "856908167094",
    appId: "1:856908167094:web:ba0e522f1664b968393317"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export {auth, googleProvider};