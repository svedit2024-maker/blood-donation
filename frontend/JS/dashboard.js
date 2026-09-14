
async function loadDonorCount() {
    try {
        const response = await fetch("http://localhost:3000/donors/count");

        const result = await response.json();

        if (!response.ok) {
            console.error(result.message);
            return;
        }

        document.getElementById("registeredDonorCount").textContent =
            result.count;

    } catch (error) {
        console.error("Failed to load donor count:", error);
    }
}

loadDonorCount();