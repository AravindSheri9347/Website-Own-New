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

  await loadUsers();

  loadRecentChats();
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

  console.log("Loaded users:", allUsers);
}
import {
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔍 SEARCH USERS
document.getElementById("searchInput").addEventListener("input", () => {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const resultDiv = document.getElementById("searchResults");
  resultDiv.innerHTML = "";

  if (!value) return;

  const filtered = allUsers.filter(u =>
  (u.name || "").toLowerCase().includes(value) ||
  (u.email || "").toLowerCase().includes(value)
);

  filtered.forEach(user => {
    const div = document.createElement("div");
    div.innerText = `${user.name} (${user.email})`;

    div.onclick = () => openChat(user);

    resultDiv.appendChild(div);
  });
});

// 👉 OPEN CHAT
window.openChat = function(user) {

  console.log("Opening chat with:", user);

  localStorage.setItem(
    "chatUser",
    JSON.stringify({
      uid: user.uid,
      name: user.name,
      email: user.email
    })
  );

  window.location.href = "chat.html";
};
// 🚪 LOGOUT
window.logout = function () {
  signOut(auth);
  window.location.href = "index.html";
};

function loadRecentChats() {
  const chatList = document.getElementById("chatList");

  const q = query(collection(db, "messages"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    chatList.innerHTML = "";

    const usersMap = new Map();

    snapshot.forEach(doc => {
      const msg = doc.data();

      // only my chats
      if (
        msg.sender === currentUser.uid ||
        msg.receiver === currentUser.uid
      ) {
        const otherUserId =
          msg.sender === currentUser.uid
            ? msg.receiver
            : msg.sender;

        // store latest message only
        if (!usersMap.has(otherUserId)) {
          usersMap.set(otherUserId, msg);
        }
      }
    });

    // display
    usersMap.forEach((msg, userId) => {
      const user = allUsers.find(u => u.uid === userId);
      if (!user) return;

      const div = document.createElement("div");

      const time = msg.time?.toDate
        ? msg.time.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "";

      div.innerHTML = `
        <b>${user.name}</b><br>
        <small>${msg.text}</small>
        <span style="float:right;font-size:10px;">${time}</span>
      `;

      div.onclick = () => openChat(user);

      chatList.appendChild(div);
    });
  });
}
