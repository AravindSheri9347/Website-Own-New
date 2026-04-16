import { 
  getFirestore, collection, getDocs, addDoc, 
  serverTimestamp, onSnapshot, doc, getDoc,
  query, orderBy, updateDoc, deleteDoc   // ✅ ADD deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 GLOBAL USERS ARRAY
let allUsers = [];
let unsubscribeMessages = null;
let unsubscribeUserStatus = null;

import { app } from "./firebase.js";

import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
// 🔴 BETTER OFFLINE STATUS
document.addEventListener("visibilitychange", async () => {
  if (!currentUser) return;

  if (document.visibilityState === "hidden") {
    await updateDoc(doc(db, "users", currentUser.uid), {
      online: false,
      lastSeen: new Date()
    });
  } else {
    await updateDoc(doc(db, "users", currentUser.uid), {
      online: true
    });
  }
});

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

  displayUsers(allUsers); // ✅ show users
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
    displayUsers(allUsers); // ✅ show all again
    return;
  }

  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(value) ||
    user.email.toLowerCase().includes(value)
  );

  displayUsers(filtered);
};

// 👤 SELECT USER
function selectUser(user) {
  selectedUser = user;

  // remove old listener
  if (unsubscribeUserStatus) unsubscribeUserStatus();

  // real-time status
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
    seen: false
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

        // ✅ MARK AS SEEN
        if (msg.receiver === currentUser.uid && !msg.seen) {
          updateDoc(doc(db, "messages", docSnap.id), {
            seen: true
          });
        }

        const div = document.createElement("div");

        div.className =
          msg.sender === currentUser.uid ? "myMsg" : "otherMsg";
        
        // 🟡 MESSAGE OPTIONS (CLICK)
        div.addEventListener("click", () => {
        
          // only allow actions for YOUR messages
          if (msg.sender !== currentUser.uid) {
            navigator.clipboard.writeText(msg.text);
            alert("📋 Message copied");
            return;
          }
        
          const action = prompt(
            "Choose option:\n1 - Edit ✏️\n2 - Delete 🗑️\n3 - Copy 📋"
          );
        
          // ✏️ EDIT
          if (action === "1") {
            const newText = prompt("Edit message:", msg.text);
        
            if (newText && newText.trim() !== "") {
              updateDoc(doc(db, "messages", docSnap.id), {
                text: newText
              });
            }
          }
        
          // 🗑️ DELETE
          else if (action === "2") {
            const confirmDelete = confirm("Delete this message?");
            if (confirmDelete) {
              deleteDoc(doc(db, "messages", docSnap.id));
            }
          }
        
          // 📋 COPY
          else if (action === "3") {
            navigator.clipboard.writeText(msg.text);
            alert("📋 Copied");
          }
        
        });

        const time = msg.time?.toDate
          ? msg.time.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

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

  // ⌨️ MESSAGE BOX
  const msgBox = document.getElementById("msg");

  let typingTimeout;

  if (msgBox) {

    msgBox.addEventListener("input", async () => {
      if (!selectedUser) return;

      await updateDoc(doc(db, "users", currentUser.uid), {
        typing: true
      });

      clearTimeout(typingTimeout);

      typingTimeout = setTimeout(async () => {
        await updateDoc(doc(db, "users", currentUser.uid), {
          typing: false
        });
      }, 1500);
    });

    msgBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMsg();
    });

  }

});
