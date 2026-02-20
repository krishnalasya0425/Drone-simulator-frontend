import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const droneTrainingAPI = {
    // Get all drone categories
    getAllCategories: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/drone-training/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns { success: true, categories: [...] }
            return response.data.categories || [];
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            return [];
        }
    },

    // Get hierarchy for a specific category
    getHierarchy: async (classId, categoryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/drone-training/hierarchy/${classId}/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns { success: true, hierarchy: [...] }
            return response.data.hierarchy || [];
        } catch (error) {
            console.error('Error in getHierarchy:', error);
            return [];
        }
    },

    // Get student progress for all categories
    getStudentProgress: async (studentId, classId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/drone-training/progress/${studentId}/${classId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            // Backend returns { success: true, data: [...] }
            return response.data.data || [];
        } catch (error) {
            console.error('Error in getStudentProgress:', error);
            return [];
        }
    },

    // Get progress summary for all categories
    getProgressSummary: async (studentId, classId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/drone-training/progress-summary/${studentId}/${classId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            // Backend returns { success: true, summary: [...] }
            return response.data.summary || [];
        } catch (error) {
            console.error('Error in getProgressSummary:', error);
            return [];
        }
    },

    // Record progress (for AR/VR)
    recordProgress: async (progressData) => {
        try {
            const response = await axios.post(`${API_URL}/drone-training/progress`, progressData);
            return response.data;
        } catch (error) {
            console.error('Error in recordProgress:', error);
            throw error;
        }
    },

    // Get screenshots metadata for a student in a class
    getScreenshots: async (studentId, classId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/drone-training/screenshots/${studentId}/${classId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Error in getScreenshots:', error);
            return [];
        }
    },

    // Build the URL to display a screenshot image by its ID
    getScreenshotImageUrl: (screenshotId) => {
        return `${API_URL}/drone-training/screenshots/image/${screenshotId}`;
    }
};

export default droneTrainingAPI;
