const registerForm = document.getElementById("registerForm");
const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
if (showPassword) {
showPassword.addEventListener("change", () => {

    if (showPassword.checked) {
        password.type = "text";
    } else {
        password.type = "password";
    }

});}
if (registerForm) {
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            window.location.href = "/html/login.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
});}