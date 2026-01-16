import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Always attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('Axios error:', error);
    console.error('Error response:', error.response);

    // If there's a response from the server
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);

      // Attach the error message to the error object for easy access
      if (error.response.data?.message) {
        error.message = error.response.data.message;
      } else if (error.response.data?.error) {
        error.message = error.response.data.error;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      error.message = "❌ Network Error: Unable to connect to the server. Please check your internet connection.";
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
