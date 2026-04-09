import { app } from "./firebase.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, setDoc, doc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// REGISTER
window.register = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", user.user.uid), {
    name,
    email,
    uid: user.user.uid
  });

  alert("Registered Successfully");
  window.location.href = "index.html";
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  await signInWithEmailAndPassword(auth, email, password);

  window.location.href = "welcome.html";
};

// RESET PASSWORD
window.resetPassword = async function () {
  const email = document.getElementById("resetEmail").value;

  await sendPasswordResetEmail(auth, email);

  alert("Reset email sent");
};

// LOGOUT
window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

// NAVIGATION
window.goRegister = () => window.location.href = "Register.html";
window.goLogin = () => window.location.href = "index.html";
window.goForgot = () => window.location.href = "forgot.html";
window.openChat = () => window.location.href = "chat.html";
