
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   onAuthStateChanged,
//   signOut
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// import {
//   getFirestore,
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   serverTimestamp
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// import {
//   getStorage,
//   ref,
//   uploadBytes,
//   getDownloadURL
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// // FIREBASE CONFIG
// const firebaseConfig = {
//   apiKey: "AIzaSyB5RPmnslaA3mXVIPxapx7YMfLSp6wlA6A",
//   authDomain: "chitchat-1a684.firebaseapp.com",
//   projectId:  "chitchat-1a684",
//   storageBucket: "chitchat-1a684.firebasestorage.app",
//   // storageBucket: "chitchat-1a684.appspot.com",
//   messagingSenderId:  "753237671940",
//   appId: "1:753237671940:web:c1bfc1b2c21aee16dc3551",
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// window.checkLogin = async function () {
//   console.log("Login clicked"); // ✅ DEBUG

//   const emailInput = document.getElementById("email");
//   const passInput = document.getElementById("password");
//   const messageBox = document.getElementById("message");

//   if (!emailInput || !passInput || !messageBox) {
//     console.log("Elements not found");
//     return;
//   }

//   const email = emailInput.value.trim();
//   const password = passInput.value.trim();

//   if (!email || !password) {
//     messageBox.textContent = "Please enter email and password.";
//     return;
//   }

//   try {
//     // 🔥 LOGIN
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);

//     console.log("Login success:", userCredential.user.email);

//     localStorage.setItem("currentUser", userCredential.user.email);

//     messageBox.style.color = "green";
//     messageBox.textContent = "Login successful.";

//     // ✅ IMPORTANT CHANGE
//     window.location.replace("welcome.html");

//   } catch (error) {
//     console.error("Login error:", error.code, error.message);

//     messageBox.style.color = "red";
//     messageBox.textContent = error.message;
//   }
// };

// import { auth, db, storage } from "./firebase.js";

// // 🔥 Firebase imports
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   signOut,
//   onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// import {
//   addDoc,
//   collection,
//   serverTimestamp,
//   onSnapshot,
//   query,
//   orderBy
// } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// import {
//   ref,
//   uploadBytes,
//   getDownloadURL
// } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


// // ✅ PREVENT BLINK (VERY IMPORTANT)
// document.body.style.display = "none";


// // ================= LOGIN =================
// window.checkLogin = async function () {
//   const email = document.getElementById("email")?.value.trim();
//   const password = document.getElementById("password")?.value.trim();
//   const msg = document.getElementById("message");

//   if (!email || !password) {
//     msg.textContent = "Enter email & password";
//     return;
//   }

//   try {
//     await signInWithEmailAndPassword(auth, email, password);

//     msg.style.color = "green";
//     msg.textContent = "Login successful";

//     setTimeout(() => {
//       window.location.replace("welcome.html");
//     }, 800);

//   } catch (error) {
//     msg.style.color = "red";
//     msg.textContent = error.message;
//   }
// };


// // ================= REGISTER =================
// window.registerUser = async function () {
//   const email = document.getElementById("regEmail")?.value.trim();
//   const password = document.getElementById("regPass")?.value.trim();
//   const msg = document.getElementById("regMessage");

//   if (!email || !password) {
//     msg.textContent = "Fill all fields";
//     return;
//   }

//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);

//     await addDoc(collection(db, "users"), {
//       uid: userCredential.user.uid,
//       email: userCredential.user.email,
//       createdAt: serverTimestamp()
//     });

//     msg.style.color = "green";
//     msg.textContent = "Registered successfully";

//     setTimeout(() => {
//       window.location.replace("index.html");
//     }, 1000);

//   } catch (error) {
//     msg.style.color = "red";
//     msg.textContent = error.message;
//   }
// };


// // ================= RESET PASSWORD =================
// window.resetPassword = function () {
//   const email = document.getElementById("fpEmail")?.value.trim();
//   const msg = document.getElementById("fpMessage");

//   if (!email) {
//     msg.textContent = "Enter email";
//     return;
//   }

//   sendPasswordResetEmail(auth, email)
//     .then(() => {
//       msg.style.color = "green";
//       msg.textContent = "Reset email sent";
//     })
//     .catch((error) => {
//       msg.style.color = "red";
//       msg.textContent = error.message;
//     });
// };


// // ================= LOGOUT =================
// window.logoutUser = function () {
//   signOut(auth).then(() => {
//     window.location.replace("index.html");
//   });
// };


// // ================= SEND TEXT =================
// window.sendMessage = async function () {
//   const input = document.getElementById("chatInput");
//   if (!input) return;

//   const text = input.value.trim();
//   if (!text) return;

//   const user = auth.currentUser;
//   if (!user) return;

//   input.value = "";

//   try {
//     await addDoc(collection(db, "messages"), {
//       type: "text",
//       text,
//       uid: user.uid,
//       email: user.email,
//       createdAt: serverTimestamp()
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };


// // ================= SEND IMAGE =================
// window.sendImage = async function () {
//   const file = document.getElementById("fileInput")?.files[0];
//   if (!file) return;

//   const user = auth.currentUser;
//   if (!user) return;

//   try {
//     const fileRef = ref(storage, `images/${Date.now()}`);
//     const snap = await uploadBytes(fileRef, file);
//     const url = await getDownloadURL(snap.ref);

//     await addDoc(collection(db, "messages"), {
//       type: "image",
//       imageUrl: url,
//       uid: user.uid,
//       email: user.email,
//       createdAt: serverTimestamp()
//     });

//   } catch (error) {
//     console.error(error);
//   }
// };


// // ================= LOAD CHAT =================
// function loadChat() {
//   const chatBox = document.getElementById("chatBox");
//   if (!chatBox) return;

//   const q = query(collection(db, "messages"), orderBy("createdAt"));

//   onSnapshot(q, (snapshot) => {
//     chatBox.innerHTML = "";

//     snapshot.forEach((doc) => {
//       const msg = doc.data();
//       const div = document.createElement("div");

//       if (msg.type === "text") {
//         div.textContent = msg.text;
//       }

//       if (msg.type === "image") {
//         const img = document.createElement("img");
//         img.src = msg.imageUrl;
//         img.width = 150;
//         div.appendChild(img);
//       }

//       chatBox.appendChild(div);
//     });

//     chatBox.scrollTop = chatBox.scrollHeight;
//   });
// }


// // ================= SINGLE AUTH CONTROLLER =================
// onAuthStateChanged(auth, (user) => {

//   const page = window.location.pathname;

//   // LOGIN PAGE
//   if (page.includes("index.html")) {
//     if (user) {
//       window.location.replace("welcome.html");
//     } else {
//       document.body.style.display = "block";
//     }
//   }

//   // CHAT PAGE
//   else if (page.includes("welcome.html")) {
//     if (user) {
//       document.body.style.display = "block";
//       loadChat();
//     } else {
//       window.location.replace("index.html");
//     }
//   }

//   // OTHER PAGES
//   else {
//     document.body.style.display = "block";
//   }

// });


// // ================= ENTER KEY =================
// window.addEventListener("load", () => {
//   const input = document.getElementById("chatInput");

//   if (input) {
//     input.addEventListener("keydown", (e) => {
//       if (e.key === "Enter") {
//         e.preventDefault();
//         sendMessage();
//       }
//     });
//   }
// });



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
    const currentUser = auth.currentUser;

    chatBox.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();

      // ✅ TEXT MESSAGE
      if (msg.type === "text") {
        const div = document.createElement("div");

        div.className =
          currentUser && msg.uid === currentUser.uid
            ? "message user"
            : "message other";

        div.textContent = msg.text || "";
        chatBox.appendChild(div);
      }

      // ✅ IMAGE
      if (msg.type === "image") {
        const img = document.createElement("img");
        img.src = msg.imageUrl;
        img.className = "chat-image";
        chatBox.appendChild(img);
      }

      // ✅ VIDEO
      if (msg.type === "video") {
        const video = document.createElement("video");
        video.src = msg.videoUrl;
        video.controls = true;
        video.className = "chat-video";
        chatBox.appendChild(video);
      }
    });

    // 🔥 AUTO SCROLL TO LATEST MESSAGE
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);

  }, (error) => {
    console.error("Chat load error:", error);
  });
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadChat(); // ✅ start chat automatically
  } else {
    window.location.href = "index.html";
  }
});

  window.sendMessage = async function () {
    const input = document.getElementById("chatInput");

    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const user = auth.currentUser;
    if (!user) return;

    // ✅ CLEAR INPUT FIRST
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

        // ✅ INSTANT SCROLL (fallback)
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("Send error:", error);

        // restore text if failed
        input.value = text;
    }
};
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
