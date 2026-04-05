// 🔥 IMPORTS (TOP OF FILE)
import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
collection,
addDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =======================
// 🔐 LOGIN FUNCTION
// =======================
function checkLogin() {
var user = document.getElementById("username").value;
var pass = document.getElementById("password").value;

```
signInWithEmailAndPassword(auth, user, pass)
    .then(() => {
        document.getElementById("message").innerHTML = "Login Successful!";

        setTimeout(() => {
            window.location.href = "welcome.html";
        }, 1000);
    })
    .catch(() => {
        document.getElementById("message").innerHTML = "Invalid Email or Password!";
    });
```

}

// =======================
// 📝 REGISTER FUNCTION
// =======================
function registerUser() {
var user = document.getElementById("regUser").value;
var pass = document.getElementById("regPass").value;

```
if (user === "" || pass === "") {
    document.getElementById("regMessage").innerHTML = "Please fill all fields!";
    return;
}

createUserWithEmailAndPassword(auth, user, pass)
    .then(() => {
        document.getElementById("regMessage").innerHTML = "Registered Successfully!";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    })
    .catch(error => {
        document.getElementById("regMessage").innerHTML = error.message;
    });
```

}

// =======================
// 💬 SEND MESSAGE (FIREBASE)
// =======================
async function sendMessage() {
var input = document.getElementById("chatInput");
var message = input.value;

```
if (message === "") return;

await addDoc(collection(db, "messages"), {
    text: message,
    time: new Date()
});

input.value = "";
```

}

// =======================
// 📥 LOAD CHAT (REAL-TIME)
// =======================
function loadChat() {
var chatBox = document.getElementById("chatBox");

```
onSnapshot(collection(db, "messages"), (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach(doc => {
        var msg = doc.data();

        var div = document.createElement("div");
        div.className = "message user";
        div.innerText = msg.text;

        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
});
```

}

// =======================
// 🔁 NAVIGATION FUNCTIONS
// =======================
function goToRegister() {
window.location.href = "register.html";
}

function goToForgot() {
window.location.href = "forgot.html";
}

// =======================
// 🔄 RESET PASSWORD (TEMP - LOCAL ONLY)
// =======================
function resetPassword() {
var newPass = document.getElementById("newPass").value;
var confirmPass = document.getElementById("confirmPass").value;

```
if (newPass === "" || confirmPass === "") {
    document.getElementById("fpMessage").innerHTML = "Fill all fields!";
    return;
}

if (newPass !== confirmPass) {
    document.getElementById("fpMessage").innerHTML = "Passwords do not match!";
    return;
}

document.getElementById("fpMessage").innerHTML = "Use Firebase reset (next step)";
```

}

// =======================
// 🚀 AUTO LOAD CHAT
// =======================
window.onload = function () {
if (document.getElementById("chatBox")) {
loadChat();
}
};

window.sendMessage = sendMessage;
window.logout = logout;
// =======================
// 🌐 MAKE FUNCTIONS GLOBAL
// =======================
window.registerUser = registerUser;
window.checkLogin = checkLogin;
window.sendMessage = sendMessage;
window.goToRegister = goToRegister;
window.goToForgot = goToForgot;
window.resetPassword = resetPassword;
