import { useState } from "react";
import api from "../entities/axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    regiment: "",
    batch_no: "",
    army_id: "",
    role: "student",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    // If it was a success message, redirect to login
    if (modal.type === "success") {
      navigate("/login");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/register", form);
      console.log('Registration success:', response.data);

      setModal({
        isOpen: true,
        title: "Registration Successful",
        message: response.data.message || "Registration submitted. Await approval.",
        type: "success"
      });

    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = "Error registering";
      let errorTitle = "Registration Failed";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Specific handling based on backend messages
      if (errorMessage.includes("Already Registered") || errorMessage.includes("already exists")) {
        errorTitle = "User Already Exists";
      } else if (errorMessage.includes("Weak Password")) {
        errorTitle = "Weak Password";
      } else if (errorMessage.includes("Missing")) {
        errorTitle = "Missing Information";
      } else if (errorMessage.includes("Invalid Name")) {
        errorTitle = "Invalid Name";
      } else if (errorMessage.includes("Invalid Army ID")) {
        errorTitle = "Invalid Army ID";
      }

      

      setModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        type: "error"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <InfoModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="20" cy="20" r="20" fill="#074F06" />
            <path d="M20 10C16.134 10 13 13.134 13 17C13 22.25 20 30 20 30C20 30 27 22.25 27 17C27 13.134 23.866 10 20 10ZM20 19.5C18.619 19.5 17.5 18.381 17.5 17C17.5 15.619 18.619 14.5 20 14.5C21.381 14.5 22.5 15.619 22.5 17C22.5 18.381 21.381 19.5 20 19.5Z" fill="white" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: '#074F06' }}>VR-MaRS</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800">
          Create Account
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Fill the details below to register
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="col-span-2 w-full px-4 py-2 border rounded-lg outline-none"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
            required
          />

          <input
            name="regiment"
            placeholder="Regiment"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
            required
          />

          <input
            name="batch_no"
            placeholder="Batch No"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
            required
          />

          <input
            name="army_id"
            placeholder="Army ID"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
            required
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
            required
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>

          <div className="relative col-span-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg outline-none pr-10"
              style={{ transition: 'box-shadow 0.2s' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
              onBlur={(e) => e.target.style.boxShadow = ''}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="col-span-2 w-full py-2 text-white rounded-lg font-semibold transition"
            style={{ backgroundColor: '#074F06' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
          >
            Register
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="hover:underline" style={{ color: '#074F06' }}>
            Login here
          </a>
        </p>

      </div>
    </div>
  );
}
