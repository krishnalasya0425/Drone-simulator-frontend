

const API_BASE_URL = "http://localhost:5000/c";

// Generic request helper
async function apiRequest(url, method = "GET", body = null) {
  const options = { method, headers: {} };

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
   getAllClasses(id = null) {
    let url = `${API_BASE_URL}`;
    if (id) url += `?id=${id}`;
    return apiRequest(url, "GET");
  },

  getClassInfo(Id){
     return apiRequest(`${API_BASE_URL}/${Id}`);
  },


  addClass(className, createdBy) {
    return apiRequest(`${API_BASE_URL}/`, "POST", { className, createdBy });
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

  deleteDocs(id) {
    return apiRequest(`${API_BASE_URL}/docs/${id}`, "DELETE");
  },

  updateDocs(id, doc_title) {
    return apiRequest(`${API_BASE_URL}/docs/${id}`, "PUT", { doc_title });
  },

  async uploadDocs(class_id, doc_title, file) {

    const formData = new FormData();
    formData.append("class_id", class_id);
    formData.append("doc_title", doc_title);
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/docs`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  },

 
  async getDocs(id) {
  const endpoint = `${API_BASE_URL}/docs/${id}`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  return await res.json(); 
},


};



export default classAPI;


