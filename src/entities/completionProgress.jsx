import api from "../entities/axios";

const CompletionProgressService = {
  
  createOrUpdateProgress(data) {
    return api.post('/completion-progress', data);
  },

  
  getProgressByStudentAndClass(studentId, classId) {
    return api.get(`/completion-progress/${studentId}/${classId}`);
  },

  deleteProgress(id) {
    return api.delete(`/completion-progress/${id}`);
  },

 
  deleteProgressByUserAndClass(userId, classId) {
    return api.delete(`/completion-progress/user/${userId}/class/${classId}`);
  },
};

export default CompletionProgressService;
