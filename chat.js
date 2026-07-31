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
let selectedUser = JSON.parse(localStorage.getItem("chatUser"));
console.log("Selected User:", selectedUser);

// 🔐 AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  // ✅ set online
  await updateDoc(doc(db, "users", user.uid), {
    online: true
  });

  // ✅ show selected user name (NOT welcome)
  if (selectedUser) {

    document.getElementById("chatWith").innerText =
        selectedUser.name;

    document.getElementById("chatStatus").innerText =
        "offline";

    selectUser(selectedUser);
}

// ✅ load messages
loadMessages();
});


window.goBack = function () {
  window.location.href = "home.html";
};

// 🔴 OFFLINE STATUS
// 🔴 BETTER OFFLINE STATUS
document.addEventListener("visibilitychange", async () => {
  if (!currentUser) return;

  if (document.visibilityState === "hidden") {
    await updateDoc(doc(db, "users", currentUser.uid), {
      online: false,
      lastSeen: serverTimestamp()
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
      lastSeen: serverTimestamp()
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

    // Remove old listener
    if (unsubscribeUserStatus) {
        unsubscribeUserStatus();
    }

    unsubscribeUserStatus = onSnapshot(
        doc(db, "users", user.uid),
        (docSnap) => {

            if (!docSnap.exists()) {
                document.getElementById("chatStatus").innerText = "Offline";
                return;
            }

            const data = docSnap.data();

            let status = "";

            if (data.typing) {

                status = "✍️ Typing...";

            } else if (data.online) {

                status = "🟢 Online";

            } else if (data.lastSeen) {

                status =
                    "Last seen: " +
                    data.lastSeen.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

            } else {

                status = "Offline";

            }

            document.getElementById("chatWith").innerText = data.name;
            document.getElementById("chatStatus").innerText = status;

        }
    );

    loadMessages();

}
// 💬 SEND MESSAGE
async function sendMsg() {

  const input = document.getElementById("msg");

  if (!input) {
    console.log("Message input not found");
    return;
  }


  const text = input.value.trim();


  if (text === "") {
    return;
  }


  if (!currentUser) {
    console.log("Current user not loaded");
    return;
  }


  if (!selectedUser) {
    alert("Select a user first");
    return;
  }


  try {

    await addDoc(collection(db, "messages"), {

      sender: currentUser.uid,
  
      receiver: selectedUser.uid,
  
      text: text,
  
      time: serverTimestamp(),
  
      delivered: false,
  
      seen: false,
  
      edited: false,
  
      deletedFor: []
  
  });


    // clear input after sending
    input.value = "";


  } catch (error) {

    console.error("Send message error:", error);

  }

}


// make it available for button click
window.sendMsg = sendMsg;


// 📥 LOAD MESSAGES
function loadMessages() {

    const messagesDiv = document.getElementById("messages");

    if (!messagesDiv || !currentUser || !selectedUser) {
        return;
    }

    // Remove previous listener
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    const q = query(
        collection(db, "messages"),
        orderBy("time", "asc")
    );

    unsubscribeMessages = onSnapshot(q, (snapshot) => {

        messagesDiv.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const msg = docSnap.data();
            // Mark delivered and seen
            if (msg.receiver === currentUser.uid) {
            
                if (!msg.delivered) {
            
                    updateDoc(doc(db, "messages", docSnap.id), {
                        delivered: true
                    });
            
                }
            
                if (!msg.seen) {
            
                    updateDoc(doc(db, "messages", docSnap.id), {
                        seen: true
                    });
            
                }
            
            }

            // Show only current chat
            const isChat =
                (msg.sender === currentUser.uid &&
                    msg.receiver === selectedUser.uid) ||

                (msg.sender === selectedUser.uid &&
                    msg.receiver === currentUser.uid);

            if (!isChat) return;

            // Hide if deleted for me
            if (
                msg.deletedFor &&
                Array.isArray(msg.deletedFor) &&
                msg.deletedFor.includes(currentUser.uid)
            ) {
                return;
            }

            // ==========================
            // DELIVERED & SEEN
            // ==========================

            if (msg.receiver === currentUser.uid) {

                if (!msg.delivered) {

                    updateDoc(doc(db, "messages", docSnap.id), {
                        delivered: true
                    });

                }

                if (!msg.seen) {

                    updateDoc(doc(db, "messages", docSnap.id), {
                        seen: true
                    });

                }

            }

            // ==========================
            // MESSAGE DIV
            // ==========================

            const div = document.createElement("div");

            div.className =
                msg.sender === currentUser.uid
                    ? "myMsg"
                    : "otherMsg";

            // Time
            const time = msg.time?.toDate
                ? msg.time.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                  })
                : "";

            // ==========================
            // TICKS
            // ==========================

            let tick = "";

            if (msg.sender === currentUser.uid) {

                if (msg.seen) {

                    // Green double tick
                    tick =
                        '<span style="color:#25D366;">✔✔</span>';

                }
                else if (msg.delivered) {

                    // White double tick
                    tick = "✔✔";

                }
                else {

                    // Single tick
                    tick = "✔";

                }

            }

            // Edited
            const edited =
                msg.edited ? " (edited)" : "";

            // ==========================
            // HTML
            // ==========================

            div.innerHTML = `
                <div class="msgText">
                    ${msg.text}${edited}
                </div>

                <small>
                    ${time} ${tick}
                </small>
            `;

            // ==========================
            // CLICK
            // ==========================

            div.addEventListener("click", (e) => {

              e.stopPropagation();
          
              showMessageOptions(docSnap.id, msg);
          
          });

                // Next step:
                showMessageOptions(docSnap.id, msg);

            });

            messagesDiv.appendChild(div);

        });

        messagesDiv.scrollTop =
            messagesDiv.scrollHeight;

    });

}
    // Auto scroll
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

  });

}
function showMessageOptions(msgId, msg) {

    // Remove existing popup
    document.querySelectorAll(".msgMenu, .menuOverlay")
        .forEach(e => e.remove());

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "menuOverlay";

    // Menu
    const menu = document.createElement("div");
    menu.className = "msgMenu";

    function addItem(text, onclick) {

        const item = document.createElement("div");

        item.innerText = text;

        item.onclick = () => {

            onclick();

            overlay.remove();
            menu.remove();

        };

        menu.appendChild(item);

    }

    // Copy
    addItem("📋 Copy", () => {

        navigator.clipboard.writeText(msg.text);

        alert("Copied");

    });

    // Edit (only sender)
    if (msg.sender === currentUser.uid) {

        addItem("✏️ Edit", () => {

            editMessage(msgId, msg.text);

        });

    }

    // Delete for Me
    addItem("🗑 Delete for Me", () => {

        deleteForMe(msgId);

    });

    // Delete for Everyone (only sender)
    if (msg.sender === currentUser.uid) {

        addItem("🚫 Delete for Everyone", () => {

            deleteForEveryone(msgId);

        });

    }

    // Cancel
    addItem("❌ Cancel", () => {});

    overlay.onclick = () => {

        overlay.remove();
        menu.remove();

    };

    document.body.appendChild(overlay);
    document.body.appendChild(menu);

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

    // SEND BUTTON
    const sendBtn = document.getElementById("sendBtn");

    if (sendBtn) {
        sendBtn.onclick = sendMsg;   // Prevent duplicate click listeners
    }

    // MESSAGE INPUT
    const input = document.getElementById("msg");

    if (!input) return;

    // ENTER KEY SEND
    input.onkeydown = (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMsg();

        }

    };

    // =========================
    // TYPING STATUS
    // =========================

    let typingTimeout = null;

    input.addEventListener("input", async () => {

        if (!currentUser || !selectedUser) return;

        try {

            await updateDoc(doc(db, "users", currentUser.uid), {
                typing: true
            });

        } catch (err) {

            console.log(err);

        }

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(async () => {

            try {

                await updateDoc(doc(db, "users", currentUser.uid), {
                    typing: false
                });

            } catch (err) {

                console.log(err);

            }

        }, 1500);

    });

});
