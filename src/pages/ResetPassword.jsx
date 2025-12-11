import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';


const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Both fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/resetpassword`, {
        email,
        token,
        newPassword,
      });

      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
 

      <h2 className="text-2xl font-bold text-egreen mb-6 text-center">
        Reset Password
      </h2>

      {error && (
        <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm mb-2 text-center">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            New Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-egreen"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-egreen"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-egreen hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
);

};

export default ResetPassword;
