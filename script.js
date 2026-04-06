// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB5RPmnslaA3mXVIPxapx7YMfLSp6wlA6A",
  authDomain: "chitchat-1a684.firebaseapp.com",
  projectId:  "chitchat-1a684",
  storageBucket: "chitchat-1a684.firebasestorage.app",
  messagingSenderId:  "753237671940",
  appId: "1:753237671940:web:c1bfc1b2c21aee16dc3551",
};

// INITIALIZE
firebase.initializeApp(firebaseConfig);


function checkLogin() {
    var emailInput = document.getElementById("email");
    var passInput = document.getElementById("password");
    var messageBox = document.getElementById("message");

    // ✅ Check if elements exist (prevents null errors)
    if (!emailInput || !passInput || !messageBox) {
        console.error("Missing HTML elements");
        return;
    }

    var email = emailInput.value.trim();
    var password = passInput.value.trim();

    // ✅ Basic validation
    if (email === "" || password === "") {
        messageBox.innerHTML = "Please enter email and password!";
        return;
    }

    // ✅ Firebase Login
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {

        // Save user
        localStorage.setItem("currentUser", email);

        messageBox.innerHTML = "Login Successful!";

        setTimeout(() => {
            window.location.href = "welcome.html";
        }, 1000);

    })
    .catch((error) => {

        console.log("Login Error:", error.code);

        // ❌ USER NOT FOUND → go to Register
        if (error.code === "auth/user-not-found") {

            localStorage.setItem("tempEmail", email);

            messageBox.innerHTML =
                "User not found. Redirecting to Register...";

            setTimeout(() => {
                window.location.href = "Register.html";
            }, 1500);
        }

        // ❌ WRONG PASSWORD
        else if (error.code === "auth/wrong-password") {
            messageBox.innerHTML = "Incorrect password!";
        }

        // ❌ INVALID EMAIL
        else if (error.code === "auth/invalid-email") {
            messageBox.innerHTML = "Invalid email format!";
        }

        // ❌ TOO MANY REQUESTS (important case)
        else if (error.code === "auth/too-many-requests") {
            messageBox.innerHTML = "Too many attempts. Try later!";
        }

        // ❌ DEFAULT ERROR
        else {
            messageBox.innerHTML = error.message;
        }
    });
}


// REGISTER FUNCTION
function registerUser() {
    var email = document.getElementById("regEmail").value;
    var pass = document.getElementById("regPass").value;

    if (email === "" || pass === "") {
        document.getElementById("regMessage").innerHTML = "Fill all fields!";
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(() => {

        document.getElementById("regMessage").innerHTML =
            "Registered Successfully! Redirecting to Login...";

        // clear temp email
        localStorage.removeItem("tempEmail");

        setTimeout(() => {
            window.location.href = "index.html"; // back to login
        }, 1500);

    })
    .catch((error) => {
        document.getElementById("regMessage").innerHTML = error.message;
    });
}

// ✅ ADD THIS AT THE END (CHAT FUNCTION)
function sendMessage() {
    var input = document.getElementById("chatInput");
    var message = input.value;

    if (message === "") return;

    var chatBox = document.getElementById("chatBox");

    var userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerText = message;
    chatBox.appendChild(userMsg);

    var botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.innerText = "You said: " + message;
    chatBox.appendChild(botMsg);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

function goToRegister() {
    window.location.href = "Register.html";
}

function goToForgot() {
    var user = document.getElementById("username").value;

    // store username temporarily
    localStorage.setItem("tempUser", user);

    window.location.href = "forgot.html";
}

function resetPassword() {
    var user = document.getElementById("fpUser").value;
    var newPass = document.getElementById("newPass").value;
    var confirmPass = document.getElementById("confirmPass").value;

    if (newPass === "" || confirmPass === "") {
        document.getElementById("fpMessage").innerHTML = "Fill all fields!";
        return;
    }

    if (newPass !== confirmPass) {
        document.getElementById("fpMessage").innerHTML = "Passwords do not match!";
        return;
    }

    // ✅ Update stored data
    localStorage.setItem("username", user);
    localStorage.setItem("password", newPass);
    document.getElementById("regEmail").value =
    localStorage.getItem("tempEmail");

    document.getElementById("fpMessage").innerHTML = "Password Updated Successfully!";

    // ✅ Small delay then redirect
    setTimeout(function () {
        window.location.href = "index.html";
    }, 1500);
}

function sendMessage() {
    var input = document.getElementById("chatInput");
    var message = input.value;

    if (message === "") return;

    var chatData = JSON.parse(localStorage.getItem("chat")) || [];

    chatData.push({
        type: "text",
        text: message
    });

    localStorage.setItem("chat", JSON.stringify(chatData));

    input.value = "";
    loadChat();
}
function sendImage() {
    var file = document.getElementById("fileInput").files[0];

    if (!file) return;

    var reader = new FileReader();

    reader.onload = function () {
        var chatData = JSON.parse(localStorage.getItem("chat")) || [];

        chatData.push({
            type: "image",
            src: reader.result
        });

        localStorage.setItem("chat", JSON.stringify(chatData));
        loadChat();
    };

    reader.readAsDataURL(file);
}
function loadChat() {
    var chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    var chatData = JSON.parse(localStorage.getItem("chat")) || [];

    chatData.forEach(msg => {
        if (msg.type === "text") {
            var div = document.createElement("div");
            div.className = "message user";
            div.innerText = msg.text;
            chatBox.appendChild(div);
        }

        if (msg.type === "image") {
            var img = document.createElement("img");
            img.src = msg.src;
            img.className = "chat-image";
            chatBox.appendChild(img);
        }
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}
window.onload = function () {

    var emailBox = document.getElementById("regEmail");

    if (emailBox) {
        var savedEmail = localStorage.getItem("tempEmail");
        if (savedEmail) {
            emailBox.value = savedEmail;
        }
    }
};
console.log("Firebase Loaded:", firebase);
