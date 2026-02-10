

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/classes`;

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

// MAIN API OBJECT
export const classAPI = {
  // =======================
  // CLASSES
  // =======================
  getAllClasses(id = null, role = null) {
    let url = `${API_BASE_URL}`;

    if (role === "Student") {
      url += `/assigned?id=${id}`;
    }
    else if (id && role) {
      // Pass both id and role for admin/instructor filtering
      url += `?id=${id}&role=${role}`;
    }
    else if (id) {
      url += `?id=${id}`;
    }

    return apiRequest(url, "GET");
  },


  getClassInfo(Id) {
    return apiRequest(`${API_BASE_URL}/${Id}`);
  },


  addClass(className, createdBy) {
    return apiRequest(`${API_BASE_URL}/`, "POST", { className, createdBy });
  },

  async adminAddClass(formData) {
    const token = localStorage.getItem("token");

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/`, {
      method: "POST",
      headers, // ❗ do NOT set Content-Type for FormData
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API error: ${res.status}`);
    }

    return data;
  },

  updateClass(classId, className) {
    return apiRequest(`${API_BASE_URL}/${classId}`, "PUT", { className });
  },

  deleteClass(classId) {
    return apiRequest(`${API_BASE_URL}/${classId}`, "DELETE");
  },

  //===============
  //    Docs     
  //===============

  deleteDoc(classId, docId) {
    return apiRequest(`${API_BASE_URL}/${classId}/docs/${docId}`, "DELETE");
  },

  deleteDocs(id) {
    return apiRequest(`${API_BASE_URL}/docs/${id}`, "DELETE");
  },

  updateDocs(id, doc_title) {
    return apiRequest(`${API_BASE_URL}/docs/${id}`, "PUT", { doc_title });
  },

  async uploadDocs(class_id, doc_title, file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("class_id", class_id);
    formData.append("doc_title", doc_title);
    formData.append("file", file);

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/docs`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  },


  async getDocs(id) {
    const token = localStorage.getItem("token");
    const endpoint = `${API_BASE_URL}/docs/${id}`;

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, { headers });

    if (!res.ok) {
      throw new Error("Failed to fetch documents");
    }

    return await res.json();
  },

  // Get students in a class
  async getStudentsInClass(classId) {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/classes/${classId}/students`, { headers });

    if (!res.ok) {
      throw new Error("Failed to fetch students");
    }

    return await res.json();
  },

  // Get instructors in a class
  async getInstructorsInClass(classId) {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/classes/${classId}/instructors`, { headers });

    if (!res.ok) {
      throw new Error("Failed to fetch instructors");
    }

    return await res.json();
  },

  // Add instructors to a class
  async addInstructorsToClass(classId, instructorIds, userRole) {
    return apiRequest(
      `${API_BASE_URL}/${classId}/instructors`,
      "POST",
      { instructorIds, userRole }
    );
  },

  // Remove instructors from a class
  async removeInstructorsFromClass(classId, instructorIds, userRole) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/${classId}/instructors`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ instructorIds, userRole })
    });

    if (!res.ok) {
      throw new Error("Failed to remove instructors");
    }

    return await res.json();
  },

  // Update instructors for a class
  async updateClassInstructors(classId, instructorIds, userRole) {
    return apiRequest(
      `${API_BASE_URL}/${classId}/instructors`,
      "PUT",
      { instructorIds, userRole }
    );
  },


};



export default classAPI;