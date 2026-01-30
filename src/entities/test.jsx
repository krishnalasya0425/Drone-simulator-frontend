


const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/tests`;

// Generic request helper
async function apiRequest(url, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    const options = { method, headers: {} };

    // Add Authorization header if token exists
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

const testAPI = {
    // =======================
    // TESTS CRUD
    // =======================
    getAllTests(id = null, role = null) {
        let url = `${API_BASE_URL}`;

        if (role === "Student") {
            url += `/assigned?id=${id}`;
        }
        else if (id) {
            url += `?id=${id}`;
        }

        return apiRequest(url, "GET");
    },

    getTestInfo(Id) {
        return apiRequest(`${API_BASE_URL}/${Id}`);
    },

    getDownloadPdf(Id) {
        return apiRequest(`${API_BASE_URL}/download/${Id}`);
    },

    getTestScoreInfo(Id) {
        return apiRequest(`${API_BASE_URL}/score/${Id}`);
    },

    updateTest(testId, testName) {
        return apiRequest(`${API_BASE_URL}/${testId}`, "PUT", { testName });
    },

    deleteTest(testId) {
        return apiRequest(`${API_BASE_URL}/${testId}`, "DELETE");
    },

    // Create a new test
    async addTest(title, ID, classId, individualStudentId = null, requestId = null) {
        console.log('Creating test:', { title, ID, classId, individualStudentId, requestId });
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    ID,
                    classId,
                    individualStudentId,
                    requestId
                })
            });
            if (!response.ok) throw new Error('Failed to create test');
            return await response.json();
        } catch (error) {
            console.error('Error creating test:', error);
            throw error;
        }
    },

    // =======================
    // QUESTIONS
    // =======================
    async getQuestionsByTestId(testId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${testId}/questions`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    async addQuestions(testId, payload) {
        try {
            const res = await fetch(`${API_BASE_URL}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId,
                    questions: payload
                })
            });

            if (!res.ok) throw new Error('Failed to add questions');
            return await res.json();
        } catch (error) {
            console.error('Error adding questions:', error);
            throw error;
        }
    },

    // =======================
    // ANSWERS
    // =======================
    async getTestAnswers(testId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${testId}/answers`);
            if (!response.ok) throw new Error('Failed to fetch answers');
            return await response.json();
        } catch (error) {
            console.error('Error fetching answers:', error);
            throw error;
        }
    },

    // =======================
    // TEST SETS (New)
    // =======================
    async generateSetsFromPdf(testId, formData) {
        try {
            // Note: We use the base URL + /test-sets route, but API_BASE_URL points to /tests.
            // We need to construct the URL correctly or use absolute path if simpler.
            // Based on list_dir, testSetRoutes are mounted at /test-sets (server.js line 74)
            // So URL should be: API_ROOT/test-sets/generate-from-pdf/:testId

            const API_ROOT = API_BASE_URL.replace('/tests', '');
            const url = `${API_ROOT}/test-sets/generate-from-pdf/${testId}`;

            console.log('Uploading sets to:', url);

            const res = await fetch(url, {
                method: "POST",
                // Do NOT set Content-Type header when sending FormData, 
                // browser sets it automatically with boundary
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to upload sets');
            }
            return await res.json();
        } catch (error) {
            console.error('Error generating sets:', error);
            throw error;
        }
    },
};

export default testAPI;