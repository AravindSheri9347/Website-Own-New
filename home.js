import { app } from "./firebase.js";

import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let allUsers = [];

// 🔐 AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  loadUsers();
});

// 🔍 LOAD USERS
async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));

  allUsers = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.uid !== currentUser.uid) {
      allUsers.push(data);
    }
  });
}

// 🔍 SEARCH USERS
document.getElementById("searchInput").addEventListener("input", () => {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const resultDiv = document.getElementById("searchResults");
  resultDiv.innerHTML = "";

  if (!value) return;

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(value) ||
    u.email.toLowerCase().includes(value)
  );

  filtered.forEach(user => {
    const div = document.createElement("div");
    div.innerText = `${user.name} (${user.email})`;

    div.onclick = () => openChat(user);

    resultDiv.appendChild(div);
  });
});

// 👉 OPEN CHAT
function openChat(user) {
  localStorage.setItem("chatUser", JSON.stringify(user));
  window.location.href = "chat.html";
}

// 🚪 LOGOUT
window.logout = function () {
  signOut(auth);
  window.location.href = "index.html";
};
