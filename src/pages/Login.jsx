import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [armyNo, setArmyNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" // success, error, info
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(armyNo, password);

      if (user.role === "admin") navigate("/dashboard");
      else if (user.role === "Instructor") navigate("/dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = "Login failed";
      let errorTitle = "Error";


      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }


      if (errorMessage.includes("Incorrect Password") || errorMessage.includes("password")) {
        errorTitle = "Invalid Password";
      } else if (errorMessage.includes("Invalid Army No") || errorMessage.includes("Army No")) {
        errorTitle = "Invalid Army No";
      } else if (errorMessage.includes("Pending") || errorMessage.includes("Denied") || errorMessage.includes("Not Approved")) {
        errorTitle = "Account Status";
      } else if (errorMessage.includes("Missing Credentials")) {
        errorTitle = "Missing Information";
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

      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="20" cy="20" r="20" fill="#074F06" />
            <path d="M20 10C16.134 10 13 13.134 13 17C13 22.25 20 30 20 30C20 30 27 22.25 27 17C27 13.134 23.866 10 20 10ZM20 19.5C18.619 19.5 17.5 18.381 17.5 17C17.5 15.619 18.619 14.5 20 14.5C21.381 14.5 22.5 15.619 22.5 17C22.5 18.381 21.381 19.5 20 19.5Z" fill="white" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: '#074F06' }}>VR-MaRS</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login to your account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Army No"
            value={armyNo}
            onChange={(e) => setArmyNo(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg outline-none"
            style={{ transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
            onBlur={(e) => e.target.style.boxShadow = ''}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg outline-none pr-10"
              style={{ transition: 'box-shadow 0.2s' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #074F06'}
              onBlur={(e) => e.target.style.boxShadow = ''}
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
            className="w-full py-2 text-white rounded-lg font-semibold transition"
            style={{ backgroundColor: '#074F06' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
          >
            Login
          </button>
        </form>

        {/* Links */}
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>
            Forgot Password?{" "}
            <a href="/forgotpassword" className="hover:underline" style={{ color: '#074F06' }}>
              Click here
            </a>
          </p>

          <p className="mt-1">
            Don't have an account?{" "}
            <a href="/register" className="hover:underline" style={{ color: '#074F06' }}>
              Register here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}