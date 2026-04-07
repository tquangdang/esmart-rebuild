import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyADbYBjCmL9WjBfmITBFdgjIiBCIRZ3uVw",
  authDomain: "esmart-rebu.firebaseapp.com",
  projectId: "esmart-rebu",
  storageBucket: "esmart-rebu.firebasestorage.app",
  messagingSenderId: "54331198697",
  appId: "1:54331198697:web:5d7e626695067fe91f7478",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }