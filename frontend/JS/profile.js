async function loadProfile() {
    try {
        const response = await fetch(
            "http://localhost:3000/donors/my-profile",
            {
                credentials: "include"
            }
        );

        const result = await response.json();

        console.log("Profile response:", result);

        const container =
            document.getElementById("profile-container");

        // Not logged in
        if (response.status === 401) {
            container.innerHTML = `
                <div class="error">
                    <p>Please login first.</p>
                </div>
            `;

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

            return;
        }

        // Logged in but not a donor
        if (response.status === 404 && result.isDonor === false) {

            container.innerHTML = `
                <div class="not-donor">

                    <div class="not-donor-icon">
                        🩸
                    </div>

                    <h2>You are not registered as a donor</h2>

                    <p>
                        Register as a blood donor to create your
                        donor profile and help people in need.
                    </p>

                    <a href="donarreg.html" class="register-btn">
                        Become a Donor
                    </a>

                </div>
            `;

            return;
        }

        // Other server error
        if (!response.ok) {
            container.innerHTML = `
                <div class="error">
                    ${result.message || "Failed to load profile"}
                </div>
            `;

            return;
        }

        // Donor found
        const donor = result.donor;

        container.innerHTML = `

            <div class="profile-card">

                <div class="profile-header">

                    <div class="profile-icon">
                        🩸
                    </div>

                    <div>
                        <h2>${donor.name}</h2>

                        <p>
                            Registered Blood Donor
                        </p>
                    </div>

                </div>


                <div class="details">

                    <div class="detail-box">
                        <span class="label">
                            Name
                        </span>

                        <span class="value">
                            ${donor.name}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            Blood Group
                        </span>

                        <span class="value blood-group">
                            ${donor.bloodGroup}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            Date of Birth
                        </span>

                        <span class="value">
                            ${formatDate(donor.dateOfBirth)}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            Gender
                        </span>

                        <span class="value">
                            ${donor.gender}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            Phone
                        </span>

                        <span class="value">
                            ${donor.phone}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            State
                        </span>

                        <span class="value">
                            ${donor.state}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            City
                        </span>

                        <span class="value">
                            ${donor.city}
                        </span>
                    </div>


                    <div class="detail-box">
                        <span class="label">
                            Area
                        </span>

                        <span class="value">
                            ${donor.area}
                        </span>
                    </div>

                </div>


                <div class="status">
                    🟢 You are currently available as a donor.
                </div>

            </div>
        `;

    } catch (error) {

        console.error("Profile error:", error);

        document.getElementById(
            "profile-container"
        ).innerHTML = `
            <div class="error">
                Unable to connect to server.
            </div>
        `;
    }
}


function formatDate(dateString) {

    if (!dateString) {
        return "Not available";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN");
}


// Logout
document
    .getElementById("logout-btn")
    .addEventListener("click", () => {

        window.location.href =
            "http://localhost:3000/auth/logout";

    });


loadProfile();