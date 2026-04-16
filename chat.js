import { 
  getFirestore, collection, getDocs, addDoc, 
  serverTimestamp, onSnapshot, doc, getDoc,
  query, orderBy, updateDoc, deleteDoc   // ✅ ADD deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 GLOBAL USERS ARRAY
let allUsers = [];
let unsubscribeMessages = null;
let unsubscribeUserStatus = null;
let editMsgId = null;

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

  if (editMsgId) {
    await updateDoc(doc(db, "messages", editMsgId), {
      text: text
    });

    editMsgId = null;

    document.querySelector("button[onclick='sendMsg()']").innerText = "Send";

  } else {
    await addDoc(collection(db, "messages"), {
      text,
      sender: currentUser.uid,
      receiver: selectedUser.uid,
      time: serverTimestamp(),
      seen: false
    });
  }

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

      if (!isChat) return;

      // ❌ HIDE "DELETE FOR ME"
      if (msg.deletedFor === currentUser.uid) return;

      // ✅ MARK AS SEEN
      if (msg.receiver === currentUser.uid && !msg.seen) {
        updateDoc(doc(db, "messages", docSnap.id), {
          seen: true
        });
      }

      const div = document.createElement("div");

      div.className =
        msg.sender === currentUser.uid ? "myMsg" : "otherMsg";

      // ⏰ TIME
      const time = msg.time?.toDate
        ? msg.time.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "";

      // ✔✔ TICKS
      let tick = "";
      if (msg.sender === currentUser.uid) {
        tick = msg.seen ? "✔✔" : "✔";
      }

      div.innerHTML = `
        <div class="msgText">${msg.text}</div>
        <small style="font-size:10px;color:gray;">
          ${time} ${tick}
        </small>
      `;

      // 🟢 CLICK → SHOW ACTIONS
      div.addEventListener("click", (e) => {

        e.stopPropagation(); // 🔥 IMPORTANT FIX

        // remove old actions
        document.querySelectorAll(".msgActions").forEach(el => el.remove());

        const actions = document.createElement("div");
        actions.className = "msgActions";

        // 📋 COPY
        const copyBtn = document.createElement("span");
        copyBtn.innerText = "📋 Copy";
        
        copyBtn.onclick = (e) => {
          e.stopPropagation();
        
          navigator.clipboard.writeText(msg.text);
        
          // show copied text
          copyBtn.innerText = "✅ Copied";
        
          setTimeout(() => {
            copyBtn.innerText = "📋 Copy";
          }, 1000);
        };
        actions.appendChild(copyBtn);

        // ✏️ EDIT (ONLY YOUR MESSAGE)
        if (msg.sender === currentUser.uid) {
          const editBtn = document.createElement("span");
          editBtn.innerText = "✏️ Edit";
          
          editBtn.onclick = (e) => {
            e.stopPropagation();   // ✅ KEEP THIS
          
            const input = document.getElementById("msg");
            input.value = msg.text;
            editMsgId = docSnap.id;
          
            document.querySelector("button[onclick='sendMsg()']").innerText = "Update ✏️";
          };

          actions.appendChild(editBtn);
        }

        // 🗑️ DELETE
        if (msg.sender === currentUser.uid) {
          const deleteBtn = document.createElement("span");
          deleteBtn.innerText = "🗑️ Delete";
          deleteBtn.className = "deleteBtn"; 
          
          deleteBtn.onclick = (e) => {
            e.stopPropagation();   // ✅ IMPORTANT
          
            showDeleteOptions(docSnap.id);
          };

          actions.appendChild(deleteBtn);
        }

        div.appendChild(actions);
      });

      messagesDiv.appendChild(div);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

function showDeleteOptions(msgId) {

  // remove old elements
  document.querySelectorAll(".deleteBox, .deleteOverlay").forEach(e => e.remove());

  // overlay
  const overlay = document.createElement("div");
  overlay.className = "deleteOverlay";

  overlay.onclick = () => {
    overlay.remove();
    box.remove();
  };

  // box
  const box = document.createElement("div");
  box.className = "deleteBox";

  // delete for me
  const delMe = document.createElement("div");
  delMe.innerText = "Delete for Me";
  delMe.className = "me";
  delMe.onclick = () => deleteForMe(msgId);

  // delete for everyone
  const delEveryone = document.createElement("div");
  delEveryone.innerText = "Delete for Everyone";
  delEveryone.className = "everyone";
  delEveryone.onclick = () => deleteForEveryone(msgId);

  // cancel
  const cancel = document.createElement("div");
  cancel.innerText = "Cancel";
  cancel.className = "cancel";
  cancel.onclick = () => {
    overlay.remove();
    box.remove();
  };

  box.appendChild(delMe);
  box.appendChild(delEveryone);
  box.appendChild(cancel);

  document.body.appendChild(overlay);
  document.body.appendChild(box);
}


// ✅ DELETE FOR ME (HIDE MESSAGE)
window.deleteForMe = async function (id) {
  await updateDoc(doc(db, "messages", id), {
    deletedFor: currentUser.uid
  });

  document.querySelectorAll(".deleteBox, .deleteOverlay").forEach(e => e.remove());
};


// ✅ DELETE FOR EVERYONE
window.deleteForEveryone = async function (id) {
  await updateDoc(doc(db, "messages", id), {
    text: "🚫 Message deleted"
  });

  document.querySelectorAll(".deleteBox, .deleteOverlay").forEach(e => e.remove());
};
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
