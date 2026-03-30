// LOGIN FUNCTION
function checkLogin() {
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;

    var storedUser = localStorage.getItem("username");
    var storedPass = localStorage.getItem("password");

    if (user === storedUser && pass === storedPass) {
        document.getElementById("message").innerHTML = "Login Successful!";
        
        setTimeout(() => {
            window.location.href = "welcome.html";
        }, 1000);

    } else {
        document.getElementById("message").innerHTML = "User not found! Redirecting to Register...";

        setTimeout(() => {
            window.location.href = "register.html";
        }, 1500);
    }
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
