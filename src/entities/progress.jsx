import api from "./axios";

const API_BASE_URL = "/progress";

const progressAPI = {
    /**
     * Update student's progress for a document
     */
    updateDocumentProgress(progressData) {
        return api.post(`${API_BASE_URL}/document`, progressData);
    },

    /**
     * Get student's progress for a specific document
     */
    getDocumentProgress(studentId, docId) {
        return api.get(`${API_BASE_URL}/document/${studentId}/${docId}`);
    },

    /**
     * Get student's overall progress in a class
     */
    getClassProgress(studentId, classId) {
        return api.get(`${API_BASE_URL}/class/${studentId}/${classId}`);
    },

    /**
     * Get all students' progress in a class (for instructor/admin)
     */
    getAllStudentsProgress(classId) {
        return api.get(`${API_BASE_URL}/class/${classId}/students`);
    },

    /**
     * Get student's progress across all their classes
     */
    getStudentAllClassesProgress(studentId) {
        return api.get(`${API_BASE_URL}/student/${studentId}`);
    },

    /**
     * Get detailed document-level progress for a student in a class
     */
    getStudentClassDocuments(studentId, classId) {
        return api.get(`${API_BASE_URL}/class/${studentId}/${classId}/documents`);
    },
};

export default progressAPI;
