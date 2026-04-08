
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB5RPmnslaA3mXVIPxapx7YMfLSp6wlA6A",
  authDomain: "chitchat-1a684.firebaseapp.com",
  projectId:  "chitchat-1a684",
  storageBucket: "chitchat-1a684.firebasestorage.app",
  // storageBucket: "chitchat-1a684.appspot.com",
  messagingSenderId:  "753237671940",
  appId: "1:753237671940:web:c1bfc1b2c21aee16dc3551",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.checkLogin = async function () {
  console.log("Login clicked"); // ✅ DEBUG

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const messageBox = document.getElementById("message");

  if (!emailInput || !passInput || !messageBox) {
    console.log("Elements not found");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    messageBox.textContent = "Please enter email and password.";
    return;
  }

  try {
    // 🔥 LOGIN
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    console.log("Login success:", userCredential.user.email);

    localStorage.setItem("currentUser", userCredential.user.email);

    messageBox.style.color = "green";
    messageBox.textContent = "Login successful.";

    // ✅ IMPORTANT CHANGE
    window.location.replace("welcome.html");

  } catch (error) {
    console.error("Login error:", error.code, error.message);

    messageBox.style.color = "red";
    messageBox.textContent = error.message;
  }
};

import { auth, db, storage } from "./firebase.js";

// 🔥 Firebase imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


// ✅ PREVENT BLINK (VERY IMPORTANT)
document.body.style.display = "none";


// ================= LOGIN =================
window.checkLogin = async function () {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const msg = document.getElementById("message");

  if (!email || !password) {
    msg.textContent = "Enter email & password";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    msg.style.color = "green";
    msg.textContent = "Login successful";

    setTimeout(() => {
      window.location.replace("welcome.html");
    }, 800);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = error.message;
  }
};


// ================= REGISTER =================
window.registerUser = async function () {
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPass")?.value.trim();
  const msg = document.getElementById("regMessage");

  if (!email || !password) {
    msg.textContent = "Fill all fields";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      createdAt: serverTimestamp()
    });

    msg.style.color = "green";
    msg.textContent = "Registered successfully";

    setTimeout(() => {
      window.location.replace("index.html");
    }, 1000);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = error.message;
  }
};


// ================= RESET PASSWORD =================
window.resetPassword = function () {
  const email = document.getElementById("fpEmail")?.value.trim();
  const msg = document.getElementById("fpMessage");

  if (!email) {
    msg.textContent = "Enter email";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Reset email sent";
    })
    .catch((error) => {
      msg.style.color = "red";
      msg.textContent = error.message;
    });
};


// ================= LOGOUT =================
window.logoutUser = function () {
  signOut(auth).then(() => {
    window.location.replace("index.html");
  });
};


// ================= SEND TEXT =================
window.sendMessage = async function () {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user) return;

  input.value = "";

  try {
    await addDoc(collection(db, "messages"), {
      type: "text",
      text,
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error(error);
  }
};


// ================= SEND IMAGE =================
window.sendImage = async function () {
  const file = document.getElementById("fileInput")?.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const fileRef = ref(storage, `images/${Date.now()}`);
    const snap = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snap.ref);

    await addDoc(collection(db, "messages"), {
      type: "image",
      imageUrl: url,
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp()
    });

  } catch (error) {
    console.error(error);
  }
};


// ================= LOAD CHAT =================
function loadChat() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const q = query(collection(db, "messages"), orderBy("createdAt"));

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");

      if (msg.type === "text") {
        div.textContent = msg.text;
      }

      if (msg.type === "image") {
        const img = document.createElement("img");
        img.src = msg.imageUrl;
        img.width = 150;
        div.appendChild(img);
      }

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}


// ================= SINGLE AUTH CONTROLLER =================
onAuthStateChanged(auth, (user) => {

  const page = window.location.pathname;

  // LOGIN PAGE
  if (page.includes("index.html")) {
    if (user) {
      window.location.replace("welcome.html");
    } else {
      document.body.style.display = "block";
    }
  }

  // CHAT PAGE
  else if (page.includes("welcome.html")) {
    if (user) {
      document.body.style.display = "block";
      loadChat();
    } else {
      window.location.replace("index.html");
    }
  }

  // OTHER PAGES
  else {
    document.body.style.display = "block";
  }

});


// ================= ENTER KEY =================
window.addEventListener("load", () => {
  const input = document.getElementById("chatInput");

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});
