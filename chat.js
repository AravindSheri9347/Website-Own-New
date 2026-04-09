// 🔥 GLOBAL USERS ARRAY
let allUsers = [];
let unsubscribeMessages = null;

import { app } from "./firebase.js";

import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, collection, getDocs, addDoc, 
  serverTimestamp, onSnapshot, doc, getDoc,
  query, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let selectedUser = null;

// 🔐 AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // ✅ SET ONLINE
    await updateDoc(doc(db, "users", user.uid), {
      online: true
    });

    // ✅ Get logged-in user name
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

// 🔴 OFFLINE STATUS
window.addEventListener("beforeunload", async () => {
  if (currentUser) {
    await updateDoc(doc(db, "users", currentUser.uid), {
      online: false,
      lastSeen: new Date()
    });
  }
});

// 🔍 LOAD USERS
async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));

  allUsers = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    if (data.uid !== currentUser.uid) {
      if (data.name && data.email) {
        allUsers.push(data);
      }
    }
  });

  console.log("Loaded Users:", allUsers);
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

// 🔍 SEARCH USER
window.searchUser = function () {
  const value = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  if (!value) {
    document.getElementById("userList").innerHTML = "";
    return;
  }

  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(value) ||
    user.email.toLowerCase().includes(value)
  );

  displayUsers(filtered);
};

// 👤 SELECT USER
// let unsubscribeUserStatus = null;

function selectUser(user) {
  selectedUser = user;

  // ❌ remove old listener
  if (unsubscribeUserStatus) unsubscribeUserStatus();

  // ✅ listen real-time user status
  unsubscribeUserStatus = onSnapshot(
    doc(db, "users", user.uid),
    (docSnap) => {
      const data = docSnap.data();

      let status = "";

      if (data.typing) {
        status = "✍️ Typing...";
      } else if (data.online) {
        status = "🟢 Online";
      } else if (data.lastSeen) {
        status =
          "Last seen: " +
          new Date(data.lastSeen).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });
      } else {
        status = "Offline";
      }

      document.getElementById("chatWith").innerText =
        data.name + " - " + status;
    }
  );

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
    time: serverTimestamp(),
    seen: false   // 🔥 NEW
  });

  input.value = "";
};

// 📥 LOAD MESSAGES
function loadMessages() {
  const messagesDiv = document.getElementById("messages");

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  const q = query(collection(db, "messages"), orderBy("time"));

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(docSnap => {
      const msg = docSnap.data();

      const isChat =
        (msg.sender === currentUser.uid &&
          msg.receiver === selectedUser.uid) ||
        (msg.sender === selectedUser.uid &&
          msg.receiver === currentUser.uid);

      if (isChat) {

        // 🔥 STEP 2.3 (B) ADD HERE
        if (msg.receiver === currentUser.uid && !msg.seen) {
          updateDoc(doc(db, "messages", docSnap.id), {
            seen: true
          });
        }

        const div = document.createElement("div");

        if (msg.sender === currentUser.uid) {
          div.className = "myMsg";
        } else {
          div.className = "otherMsg";
        }

        const time = msg.time?.toDate
          ? msg.time.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        // 🔥 STEP 2.3 (C) TICK LOGIC
        let tick = "";

        if (msg.sender === currentUser.uid) {
          tick = msg.seen ? "✔✔" : "✔";
        }

        div.innerHTML = `
          <div>${msg.text}</div>
          <small style="font-size:10px;color:gray;">
            ${time} ${tick}
          </small>
        `;

        messagesDiv.appendChild(div);
      }
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
// 🚪 LOGOUT
window.logout = function () {
  auth.signOut();
  window.location.href = "index.html";
};

// ✅ DOM READY EVENTS
window.addEventListener("DOMContentLoaded", () => {

  // 🔍 SEARCH
  const searchBox = document.getElementById("searchInput");
  if (searchBox) {
    searchBox.addEventListener("input", searchUser);
  }

  // ⌨️ ENTER TO SEND
  // ⌨️ ENTER + TYPING
const msgBox = document.getElementById("msg");

let typingTimeout;

if (msgBox) {

  msgBox.addEventListener("input", async () => {
    if (!selectedUser) return;

    // ✅ set typing true
    await updateDoc(doc(db, "users", currentUser.uid), {
      typing: true
    });

    // ❌ clear old timer
    clearTimeout(typingTimeout);

    // ✅ set typing false after user stops typing
    typingTimeout = setTimeout(async () => {
      await updateDoc(doc(db, "users", currentUser.uid), {
        typing: false
      });
    }, 1500);
  });

  // ⌨️ ENTER TO SEND
  msgBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMsg();
  });

}
