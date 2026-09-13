const googleLoginBtn = document.getElementById('googleLoginBtn');
const logout = document.getElementById('logout-btn');
const loginForm = document.getElementById("loginForm");
const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
if (showPassword) {
showPassword.addEventListener("change", () => {
    password.type = showPassword.checked ? "text" : "password";
});}
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/auth/google';
    });
}

if (logout) {
    logout.addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/auth/logout';
    });
}
if(loginForm){
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (response.ok) {
        window.location.href = "http://localhost:3000/html/main.html";
    } else {
        alert("Invalid email or password");
    }
});}