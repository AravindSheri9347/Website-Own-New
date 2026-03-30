// REGISTER FUNCTION
function registerUser() {
    var user = document.getElementById("regUser").value;
    var pass = document.getElementById("regPass").value;

    if (user === "" || pass === "") {
        document.getElementById("regMessage").innerHTML = "Fill all fields!";
        return;
    }

    // Save to localStorage
    localStorage.setItem("username", user);
    localStorage.setItem("password", pass);

    alert("Registered Successfully!");

    // Go back to login page
    window.location.href = "index.html";
}


// LOGIN FUNCTION
function checkLogin() {
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;

    // Get stored data
    var storedUser = localStorage.getItem("username");
    var storedPass = localStorage.getItem("password");

    if (user === storedUser && pass === storedPass) {
        document.getElementById("message").innerHTML = "Login Successful!";
        
        // Redirect to next page
        window.location.href = "welcome.html";
    } else {
        document.getElementById("message").innerHTML = "Invalid Username or Password!";
    }
}
