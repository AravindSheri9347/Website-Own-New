function checkLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {

        localStorage.setItem("currentUser", email);

        document.getElementById("message").innerHTML = "Login Successful!";

        setTimeout(() => {
            window.location.href = "welcome.html";
        }, 1000);

    })
    .catch((error) => {

        // ❌ USER NOT FOUND
        if (error.code === "auth/user-not-found") {

            // save email for register page
            localStorage.setItem("tempEmail", email);
        
            document.getElementById("message").innerHTML =
                "User not found. Redirecting to Register...";
        
            setTimeout(() => {
                window.location.href = "Register.html";
            }, 1500);
        }

        // ❌ WRONG PASSWORD
        else if (error.code === "auth/wrong-password") {
            document.getElementById("message").innerHTML =
                "Incorrect password!";
        }

        // ❌ INVALID EMAIL
        else if (error.code === "auth/invalid-email") {
            document.getElementById("message").innerHTML =
                "Invalid email format!";
        }

        // ❌ OTHER ERRORS
        else {
            document.getElementById("message").innerHTML = error.message;
        }
    });
}


// REGISTER FUNCTION
function registerUser() {
    var user = document.getElementById("regUser").value;
    var pass = document.getElementById("regPass").value;

    if (user === "" || pass === "") {
        document.getElementById("regMessage").innerHTML = "Please fill all fields!";
        return;
    }

    // SAVE DATA
    localStorage.setItem("username", user);
    localStorage.setItem("password", pass);

    // SHOW MESSAGE
    document.getElementById("regMessage").innerHTML = "Registered Successfully! Redirecting to login...";

    // REDIRECT AFTER 2 SEC
    setTimeout(() => {
        window.location.href = "index.html";
    }, 2000);
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
    loadChat();
};

window.onload = function () {
    var user = firebase.auth().currentUser;

    if (user) {
        document.getElementById("userEmail").innerText = user.email;
    }

    loadChat();
};
