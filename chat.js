
// 🔥 GLOBAL USERS ARRAY
let allUsers = [];
let unsubscribeMessages = null;

import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { app } from "./firebase.js";
import { query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, collection, getDocs, addDoc, 
  serverTimestamp, onSnapshot, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let selectedUser = null;

// 🔐 AUTH STATE
import { updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // ✅ 🔥 ADD THIS PART (ONLINE STATUS)
    await updateDoc(doc(db, "users", user.uid), {
      online: true
    });

    // ✅ Get logged-in user name (existing)
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      document.getElementById("userName").innerText =
        "Welcome " + userDoc.data().name;
    }

    loadUsers();

  } else {
    window.location.href = "index.html";
  }
});

// offline status
window.addEventListener("beforeunload", async () => {
  if (currentUser) {
    await updateDoc(doc(db, "users", currentUser.uid), {
      online: false,
      lastSeen: new Date()
    });
  }
});

// 🔍 LOAD USERS (ONLY ONCE)
async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));

  allUsers = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.uid !== currentUser.uid) {
      allUsers.push(data);
    }
  });

  displayUsers(allUsers);
}


// 📋 DISPLAY USERS
function displayUsers(users) {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  if (users.length === 0) {
    userList.innerHTML = "<p style='color:red;'>No user found</p>";
    return;
  }

  users.forEach(user => {
    const div = document.createElement("div");
    div.innerText = `${user.name} (${user.email})`;

    div.onclick = () => selectUser(user);

    userList.appendChild(div);
  });
}


// 🔍 INSTANT SEARCH (WHATSAPP STYLE)
window.searchUser = function () {
  const value = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  if (!value) {
    displayUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter(user => {
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    return name.includes(value) || email.includes(value);
  });

  displayUsers(filtered);
};


// 👤 SELECT USER
function selectUser(user) {
  selectedUser = user;

  let status = user.online
    ? "🟢 Online"
    : user.lastSeen
      ? "Last seen: " + new Date(user.lastSeen).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Offline";

  document.getElementById("chatWith").innerText =
    user.name + " - " + status;

  loadMessages();
}

// 💬 SEND MESSAGE
window.sendMsg = async function () {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!selectedUser) {
    alert("Select user first");
    return;
  }

  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text,
    sender: currentUser.uid,
    receiver: selectedUser.uid,
    time: serverTimestamp()
  });

  input.value = "";
};

// load messages
function loadMessages() {
  const messagesDiv = document.getElementById("messages");

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  // 🔥 ORDER BY TIME (IMPORTANT FIX)
  const q = query(collection(db, "messages"), orderBy("time"));

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const msg = doc.data();

      const isChat =
        (msg.sender === currentUser.uid &&
          msg.receiver === selectedUser.uid) ||
        (msg.sender === selectedUser.uid &&
          msg.receiver === currentUser.uid);

      if (isChat) {
        const div = document.createElement("div");

        if (msg.sender === currentUser.uid) {
          div.className = "myMsg";
        } else {
          div.className = "otherMsg";
        }

        div.innerText = msg.text;

        messagesDiv.appendChild(div);
      }
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// 🚪 LOGOUT FUNCTION
window.logout = function () {
  auth.signOut();
  window.location.href = "index.html";
};


// ✅ DOM READY EVENTS (SAFE LISTENERS)
window.addEventListener("DOMContentLoaded", () => {

  // 🔍 SEARCH BAR (INSTANT SEARCH)
  const searchBox = document.getElementById("searchInput");
  if (searchBox) {
    searchBox.addEventListener("keyup", () => {
      searchUser();
    });
  }

  // ⌨️ ENTER KEY TO SEND MESSAGE
  const msgBox = document.getElementById("msg");
  if (msgBox) {
    msgBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMsg();
      }
    });
  }

});
