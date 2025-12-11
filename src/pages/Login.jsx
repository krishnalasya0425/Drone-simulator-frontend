import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [armyId, setArmyId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const user = await login(armyId, password);

    

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "Instructor") navigate("/instructor");
      else navigate("/student");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
            className="w-10 h-10 mr-2"
          />
          <h1 className="text-xl font-bold text-blue-600">Map Reading</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login to your account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Army ID"
            value={armyId}
            onChange={(e) => setArmyId(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Error Message */}
        {msg && (
          <p className="text-red-600 text-center mt-3 font-medium">{msg}</p>
        )}

        {/* Links */}
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>
            Forgot Password?{" "}
            <a href="/forgotpassword" className="text-blue-600 hover:underline">
              Click here
            </a>
          </p>

          <p className="mt-1">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
