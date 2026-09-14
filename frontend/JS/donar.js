const donorForm = document.getElementById("donorForm");

donorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const phone = document.getElementById("phone").value.trim();

    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Phone number must contain exactly 10 digits");
        return;
    }

    const donorData = {
        name: document.getElementById("name").value.trim(),
        bloodGroup: document.getElementById("bloodGroup").value,
        dateOfBirth: document.getElementById("dateOfBirth").value,
        gender: document.getElementById("gender").value,
        phone: phone,
        state: document.getElementById("state").value.trim(),
        city: document.getElementById("city").value.trim(),
        area: document.getElementById("area").value.trim(),
        consent: document.getElementById("consent").checked
    };

    try {

        const response = await fetch("http://localhost:3000/donors", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify(donorData)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Donor registration failed");
            return;
        }

        // Successful registration
        alert("Donor registration successful!");

        // Go back to dashboard
        window.location.href = "main.html";

    } catch (error) {

        console.error("Error:", error);

        alert("Unable to connect to the server.");
    }
});