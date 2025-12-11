// User entity operations

const API_BASE_URL = 'http://localhost:5000/tests'; // adjust the URL according to your backend

 const userAPI = {
    // Get all users
    async addTest(title) {
        try {
 const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title
      })
    });
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get user by ID
    async getTestAnswers(testId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${testId}/answers`);
            if (!response.ok) throw new Error('Failed to fetch user');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Add new user
    async getQuestionsByTestId(testId) {
       try {
            const response = await fetch(`${API_BASE_URL}/${testId}/questions`);
            if (!response.ok) throw new Error('Failed to fetch user');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

     async addQuestions(testId,payload) {
        try {
             const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId ,
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

  

};

export default userAPI;