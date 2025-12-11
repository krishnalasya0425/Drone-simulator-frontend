import axios from 'axios';

const API_URL = 'http://localhost:5000/users'; // Adjust base URL as needed

export const login= {
    // Get all songs
    async getAllSongs(){
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching songs:', error);
            throw error;
        }
    },

};

export default SongService;