import axios from './axios';

const droneTrainingAPI = {
    // ============================================
    // CATEGORIES
    // ============================================
    async getAllCategories() {
        try {
            const response = await axios.get('/drone-training/categories');
            return response.data.categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // ============================================
    // HIERARCHY
    // ============================================
    async getHierarchy(classId, categoryId) {
        try {
            const response = await axios.get(`/drone-training/hierarchy/${classId}/${categoryId}`);
            return response.data.hierarchy;
        } catch (error) {
            console.error('Error fetching hierarchy:', error);
            throw error;
        }
    },

    // ============================================
    // STUDENT PROGRESS
    // ============================================
    async getStudentProgress(studentId, classId, categoryId) {
        try {
            const url = categoryId 
                ? `/drone-training/progress/${studentId}/${classId}?categoryId=${categoryId}`
                : `/drone-training/progress/${studentId}/${classId}`;
            const response = await axios.get(url);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching student progress:', error);
            throw error;
        }
    },

    async getProgressSummary(studentId, classId) {
        try {
            const response = await axios.get(`/drone-training/progress-summary/${studentId}/${classId}`);
            return response.data.summary;
        } catch (error) {
            console.error('Error fetching progress summary:', error);
            throw error;
        }
    },

    async recordProgress(progressData, scorecardFile = null) {
        try {
            const formData = new FormData();

            // Add all progress data
            Object.keys(progressData).forEach(key => {
                if (progressData[key] !== null && progressData[key] !== undefined) {
                    if (typeof progressData[key] === 'object') {
                        formData.append(key, JSON.stringify(progressData[key]));
                    } else {
                        formData.append(key, progressData[key]);
                    }
                }
            });

            // Add scorecard image if provided
            if (scorecardFile) {
                formData.append('scorecard', scorecardFile);
            }

            const response = await axios.post('/drone-training/progress', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error recording progress:', error);
            throw error;
        }
    },

    // ============================================
    // INITIALIZATION
    // ============================================
    async initializeStructure(classId) {
        try {
            const response = await axios.post(`/drone-training/initialize/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Error initializing structure:', error);
            throw error;
        }
    }
};

export default droneTrainingAPI;
