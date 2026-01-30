
import axios from './axios';

const retestAPI = {
    requestRetest: (data) => axios.post('/retest/request', data),
    getInstructorRequests: (instructorId) => axios.get(`/retest/instructor/${instructorId}`),
    getStudentRequests: (studentId) => axios.get(`/retest/student/${studentId}`),
    getRetestHistory: () => axios.get('/retest/history'),
    updateStatus: (requestId, status) => axios.put(`/retest/${requestId}/status`, { status })
};

export default retestAPI;
