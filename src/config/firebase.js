import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD84tqid1ISUWiHQk72M4NrhkQ7-HvrCRc",
  authDomain: "esmart-solutions-agency-9016b.firebaseapp.com",
  projectId: "esmart-solutions-agency-9016b",
  storageBucket: "esmart-solutions-agency-9016b.firebasestorage.app",
  messagingSenderId: "958089998578",
  appId: "1:958089998578:web:03cada8e661c964f9d606b",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }