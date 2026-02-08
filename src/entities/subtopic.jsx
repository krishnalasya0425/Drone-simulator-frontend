

import api from "../entities/axios";

const SubtopicService = {
  // Create subtopic
  createSubtopic(data) {
    return api.post("/subtopics", data);
  },

  // Get all subtopics by class ID
  getSubtopicsByClassId(classId) {
    return api.get(`/subtopics/class/${classId}`);
  },

  // Get subtopic by ID
  getSubtopicById(id) {
    return api.get(`/subtopics/${id}`);
  },

  // Update subtopic
  updateSubtopic(id, data) {
    return api.put(`/subtopics/${id}`, data);
  },

  // Delete subtopic
  deleteSubtopic(id) {
    return api.delete(`/subtopics/${id}`);
  },

  deleteByIds(data) {
  return api.delete("/subtopics/bulk-delete", {
    data 
  });
}

};

export default SubtopicService;
