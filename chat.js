import { app } from "./firebase.js";

import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, collection, getDocs, query, where,
  addDoc, serverTimestamp, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let selectedUser = null;

// 🔐 GET LOGGED IN USER
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // get user name
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(doc => {
      if (doc.data().uid === user.uid) {
        document.getElementById("userName").innerText = "Welcome " + doc.data().name;
      }
    });

    loadUsers();
  }
});

// 🔍 LOAD ALL USERS
async function loadUsers() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(doc => {
    const data = doc.data();

    if (data.uid !== currentUser.uid) {
      const div = document.createElement("div");
      div.innerText = data.name + " (" + data.email + ")";
      div.onclick = () => selectUser(data);

      userList.appendChild(div);
    }
  });
}

// 🔍 SEARCH USER
window.searchUser = async function () {
  const value = document.getElementById("searchInput").value.toLowerCase();
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(doc => {
    const data = doc.data();

    if (
      data.uid !== currentUser.uid &&
      (data.name.toLowerCase().includes(value) ||
       data.email.toLowerCase().includes(value))
    ) {
      const div = document.createElement("div");
      div.innerText = data.name + " (" + data.email + ")";
      div.onclick = () => selectUser(data);

      userList.appendChild(div);
    }
  });
};

// 👤 SELECT USER
function selectUser(user) {
  selectedUser = user;

  document.getElementById("chatWith").innerText = "Chat with " + user.name;

  loadMessages();
}

// 💬 SEND MESSAGE
window.sendMsg = async function () {
  const text = document.getElementById("msg").value;

  if (!selectedUser) {
    alert("Select user first");
    return;
  }

  await addDoc(collection(db, "messages"), {
    text,
    sender: currentUser.uid,
    receiver: selectedUser.uid,
    time: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};

// 📥 LOAD MESSAGES (PRIVATE CHAT)
function loadMessages() {
  const messagesDiv = document.getElementById("messages");

  onSnapshot(collection(db, "messages"), (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const msg = doc.data();

      if (
        (msg.sender === currentUser.uid && msg.receiver === selectedUser.uid) ||
        (msg.sender === selectedUser.uid && msg.receiver === currentUser.uid)
      ) {
        const div = document.createElement("div");

        if (msg.sender === currentUser.uid) {
          div.innerText = "You: " + msg.text;
        } else {
          div.innerText = selectedUser.name + ": " + msg.text;
        }

        messagesDiv.appendChild(div);
      }
    });
  });
}

// 🚪 LOGOUT
window.logout = function () {
  auth.signOut();
  window.location.href = "index.html";
};
