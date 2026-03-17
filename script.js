/* script.js */
function checkLogin() {
    var user = document.getElementById('username').value;
    var pass = document.getElementById('password').value;

ు
    if(user == "admin" && pass == "1234") {
        document.getElementById('message').innerHTML = "Login Successful!";
        
        // window.location.href = "welcome.html";
    } else {
        document.getElementById('message').innerHTML = "Invalid Username or Password!";
    }
}
