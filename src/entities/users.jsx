import axios from 'axios';

const API_URL = 'http://localhost:5000/users'; // Adjust base URL as needed

const Users= {
    // Get all songs
    async getByRole(role){
        try {
            const response = await axios.get(`${API_URL}/${role}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching songs:', error);
            throw error;
        }
    },

};

export default Users;