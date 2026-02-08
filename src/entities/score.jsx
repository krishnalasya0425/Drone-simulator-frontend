

// Ensure API URL is properly formatted
const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Remove trailing slash if present
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }
    return 'http://localhost:5000';
};

const API_URL = `${getBaseURL()}/score`;

/**
 * Service for score-related API operations
 */
const scoreAPI = {
    /**
     * Submit a new test score
     */
    async postScore({
        test_set_id,
        student_id,
        score,
        started_at,
        submitted_at,
        answers
    }) {
        try {
            const response = await fetch(`${API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    test_set_id,
                    student_id,
                    score,
                    started_at,
                    submitted_at,
                    answers
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to submit score");
            }

            return await response.json();
        } catch (error) {
            console.error("Error posting score:", error);
            throw error;
        }
    },

    /**
     * Get detailed test review for a specific student and test set
     */
    async getTestReview(student_id, test_set_id) {
        try {
            if (!student_id || student_id === "login") {
                console.error("Invalid student_id provided to getTestReview:", student_id);
                throw new Error("Invalid student identity. Please log in again.");
            }

            const response = await fetch(`${API_URL}/review/${student_id}/${test_set_id}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                // If it's HTML, the server returned an error page
                if (text.startsWith("<!DOCTYPE")) {
                    throw new Error("Server returned an HTML error page. Check backend routes.");
                }
                try {
                    const err = JSON.parse(text);
                    throw new Error(err.message || "Failed to fetch test review");
                } catch (e) {
                    throw new Error("Failed to parse server response");
                }
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching test review:", error);
            throw error;
        }
    },

    /**
     * Get results for an entire test set (for instructors/admins)
     */
    async getTestSetResults(test_set_id) {
        try {
            if (!test_set_id) {
                throw new Error("Test set ID is required");
            }

            const url = `${API_URL}/test-set/${test_set_id}/results`;
           

            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                const status = response.status;
                const statusText = response.statusText;
                const text = await response.text();
                
                console.error(`API Error [${status} ${statusText}]:`, {
                    url,
                    status,
                    statusText,
                    responseText: text.substring(0, 200)
                });

                // Handle 404 specifically
                if (status === 404) {
                    throw new Error(`Test set results not found (404). The endpoint may not exist or the test set ID ${test_set_id} is invalid.`);
                }

                // Handle HTML error pages
                if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
                    throw new Error(`Server returned an HTML error page (${status}). Check backend routes. Endpoint: ${url}`);
                }

                // Try to parse as JSON error
                try {
                    const err = JSON.parse(text);
                    throw new Error(err.message || err.error || `Failed to fetch test set results (${status})`);
                } catch (parseError) {
                    throw new Error(`Failed to fetch test set results: ${status} ${statusText}. Server response: ${text.substring(0, 100)}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching test set results:", error);
            // Re-throw with more context if it's not already a meaningful error
            if (error.message && !error.message.includes("Test set") && !error.message.includes("404")) {
                throw new Error(`Failed to fetch test set results: ${error.message}`);
            }
            throw error;
        }
    }
};

export default scoreAPI;