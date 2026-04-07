
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

// window.checkLogin = function () {
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value.trim();
//   const message = document.getElementById("message");

//   if (!email || !password) {
//     message.textContent = "Please enter email and password.";
//     return;
//   }

//   signInWithEmailAndPassword(auth, email, password)
//     .then(() => {
//       message.style.color = "green";
//       message.textContent = "Login successful.";
//       setTimeout(() => {
//         window.location.href = "welcome.html";
//       }, 1000);
//     })
//     .catch((error) => {
//       message.style.color = "red";
//       if (error.code === "auth/user-not-found") {
//         localStorage.setItem("tempEmail", email);
//         message.textContent = "User not found. Redirecting to Register...";
//         setTimeout(() => {
//           window.location.href = "Register.html";
//         }, 1500);
//       } else {
//         message.textContent = error.message;
//       }
//     });
// };
window.checkLogin = async function () {
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const messageBox = document.getElementById("message");

  if (!emailInput || !passInput || !messageBox) return;

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    messageBox.textContent = "Please enter email and password.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("currentUser", userCredential.user.email);
    messageBox.style.color = "green";
    messageBox.textContent = "Login successful.";
    setTimeout(() => {
      window.location.href = "welcome.html";
    }, 1000);
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    messageBox.style.color = "red";
    messageBox.textContent = error.message;
  }
};
window.registerUser = function () {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPass").value.trim();
  const message = document.getElementById("regMessage");

  if (!email || !password) {
    message.textContent = "Fill all fields.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: serverTimestamp()
      });
    })
    .then(() => {
      message.style.color = "green";
      message.textContent = "Registered successfully. Redirecting to login...";
      localStorage.removeItem("tempEmail");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    })
    .catch((error) => {
      message.style.color = "red";
      message.textContent = error.message;
    });
};

window.resetPassword = function () {
  const email = document.getElementById("fpEmail").value.trim();
  const message = document.getElementById("fpMessage");

  if (!email) {
    message.textContent = "Please enter your email.";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      message.style.color = "green";
      message.textContent = "Password reset email sent.";
    })
    .catch((error) => {
      message.style.color = "red";
      message.textContent = error.message;
    });
};

window.goToForgot = function () {
  window.location.href = "forgot.html";
};

window.logoutUser = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

window.sendMessage = async function () {
    const input = document.getElementById("chatInput");

    if (!input) {
        console.error("chatInput not found");
        return;
    }

    const text = input.value.trim();
    if (!text) return;

    const user = auth.currentUser;
    if (!user) return;

    // ✅ CLEAR INPUT FIRST (KEY FIX)
    input.value = "";
    input.focus();

    try {
        await addDoc(collection(db, "messages"), {
            type: "text",
            text: text,
            email: user.email,
            uid: user.uid,
            createdAt: serverTimestamp()
        });

    } catch (error) {
        console.error("Send message error:", error.code, error.message);

        // ❗ Restore text if failed
        input.value = text;
    }
};

window.sendImage = async function () {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();

        img.onload = async function () {

            // ✅ Resize settings
            const MAX_WIDTH = 300;
            const scaleSize = MAX_WIDTH / img.width;

            const canvas = document.createElement("canvas");
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // ✅ Convert to compressed image
            canvas.toBlob(async function (blob) {

                try {
                    const fileRef = ref(storage, `chat-images/${Date.now()}.jpg`);
                    const snapshot = await uploadBytes(fileRef, blob);
                    const url = await getDownloadURL(snapshot.ref);

                    await addDoc(collection(db, "messages"), {
                        type: "image",
                        imageUrl: url,
                        email: user.email,
                        uid: user.uid,
                        createdAt: serverTimestamp()
                    });

                    // ✅ Clear input
                    fileInput.value = "";

                } catch (error) {
                    console.error("Image upload error:", error);
                }

            }, "image/jpeg", 0.7); // 70% quality
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
};

window.sendVideo = async function () {
  const videoInput = document.getElementById("videoInput");
  const file = videoInput.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const fileRef = ref(storage, `chat-videos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "messages"), {
      type: "video",
      videoUrl: url,
      email: user.email,
      uid: user.uid,
      createdAt: serverTimestamp()
    });

    videoInput.value = "";
    console.log("Video sent");
  } catch (error) {
    console.error("Video upload error:", error.code, error.message);
  }
};

function loadChat() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();

      if (msg.type === "text") {
        const div = document.createElement("div");
        div.className = msg.uid === auth.currentUser?.uid ? "message user" : "message other";
        div.textContent = msg.text || "";
        chatBox.appendChild(div);
      }

      if (msg.type === "image") {
        const img = document.createElement("img");
        img.src = msg.imageUrl;
        img.className = "chat-image";
        img.alt = "chat image";
        chatBox.appendChild(img);
      }

      if (msg.type === "video") {
        const video = document.createElement("video");
        video.src = msg.videoUrl;
        video.controls = true;
        video.className = "chat-video";
        chatBox.appendChild(video);
      }
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }, (error) => {
    console.error("Chat load error:", error);
  });
}

window.addEventListener("load", () => {
  // Enter key listener
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Auth state listener
  const userEmail = document.getElementById("userEmail");
  if (userEmail) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userEmail.textContent = user.email;
        loadChat();
      } else {
        window.location.href = "index.html";
      }
    });
  }
});
