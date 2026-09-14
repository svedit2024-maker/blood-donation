const searchButton = document.querySelector(".search-btn");

const bloodGroupInput = document.getElementById("bloodGroup");
const locationInput = document.getElementById("location");

searchButton.addEventListener("click", async () => {

    const bloodGroup = bloodGroupInput.value;
    const location = locationInput.value.trim();

    if (!bloodGroup && !location) {
        alert("Please select a blood group or enter a location");
        return;
    }

    const params = new URLSearchParams();

    if (bloodGroup) {
        params.append("bloodGroup", bloodGroup);
    }

    if (location) {
        params.append("location", location);
    }

    try {

        const response = await fetch(
            `http://localhost:3000/donors/search?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Search failed");
            return;
        }

        displayDonors(result.donors);

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
});


function displayDonors(donors) {

    let resultsContainer = document.querySelector(".donor-results");

    if (!resultsContainer) {

        resultsContainer = document.createElement("div");

        resultsContainer.className = "donor-results";

        document.querySelector(".main-content").appendChild(
            resultsContainer
        );
    }

    resultsContainer.innerHTML = "";

    if (donors.length === 0) {

        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>No donors found</h3>
                <p>Try another blood group or location.</p>
            </div>
        `;

        return;
    }

    resultsContainer.innerHTML = `
        <h3>🩸 Matching Donors (${donors.length})</h3>
    `;

    donors.forEach((donor) => {

        const donorCard = document.createElement("div");

        donorCard.className = "donor-card";

        donorCard.innerHTML = `
            <div class="donor-info">

                <h4>${donor.name}</h4>

                <div class="blood-group">
                    🩸 ${donor.bloodGroup}
                </div>

                <p>
                    📍 ${donor.area}, ${donor.city}, ${donor.state}
                </p>

                <p>
                    🟢 Available
                </p>

            </div>

            <button class="contact-btn">
                Contact
            </button>
        `;

        resultsContainer.appendChild(donorCard);
    });
}
// =========================
// RECENT ACTIVITY
// =========================

async function loadRecentActivity() {
    try {
        const response = await fetch(
            "http://localhost:3000/donors/recent"
        );

        const result = await response.json();

        console.log("Recent activity:", result);

        if (!response.ok) {
            console.error(result.message);
            return;
        }

        const activityList =
            document.getElementById("activity-list");

        if (!activityList) {
            console.error("activity-list not found");
            return;
        }

        activityList.innerHTML = "";

        if (result.donors.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-text">
                        <strong>No recent activity</strong>
                        <span>No donors registered yet</span>
                    </div>
                </div>
            `;

            return;
        }

        result.donors.forEach((donor) => {

            const activityItem =
                document.createElement("div");

            activityItem.className =
                "activity-item";

            const date = new Date(
                donor.createdAt
            );

            activityItem.innerHTML = `
                <div class="activity-icon">
                    🩸
                </div>

                <div class="activity-text">

                    <strong>
                        New ${donor.bloodGroup} donor registered
                    </strong>

                    <span>
                        ${donor.city} •
                        ${date.toLocaleDateString()}
                    </span>

                </div>
            `;

            activityList.appendChild(
                activityItem
            );

        });

    } catch (error) {

        console.error(
            "Recent activity error:",
            error
        );

    }
}


loadRecentActivity();