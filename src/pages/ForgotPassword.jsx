import { useState } from "react";
import api from "../entities/axios";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [armyId, setArmyId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    try {
      await api.post("/otp/request", { armyId });
      setMsg("OTP requested. Ask your instructor for the OTP.");
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to request OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post("/otp/reset", { armyId, otp, newPassword });
      setMsg("Password updated successfully!");
      setStep(3);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full border border-gray-200">

        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="20" cy="20" r="20" fill="#074F06" />
            <path d="M20 10C16.134 10 13 13.134 13 17C13 22.25 20 30 20 30C20 30 27 22.25 27 17C27 13.134 23.866 10 20 10ZM20 19.5C18.619 19.5 17.5 18.381 17.5 17C17.5 15.619 18.619 14.5 20 14.5C21.381 14.5 22.5 15.619 22.5 17C22.5 18.381 21.381 19.5 20 19.5Z" fill="white" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: '#074F06' }}>VR-MaRS</h1>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Forgot Password
        </h2>

        {msg && (
          <p className="text-center mb-4 text-sm font-medium" style={{ color: '#074F06' }}>
            {msg}
          </p>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <input
              className="input-field"
              placeholder="Enter your Army ID"
              value={armyId}
              onChange={(e) => setArmyId(e.target.value)}
            />

            <button
              onClick={handleRequestOtp}
              className="blue-btn mt-3"
            >
              Request OTP
            </button>

            <p className="text-sm text-center mt-4">
              Remember your password?{" "}
              <a href="/login" className="hover:underline" style={{ color: '#074F06' }}>
                Login
              </a>
            </p>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <input
              className="input-field"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="password"
              className="input-field mt-2"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={handleResetPassword}
              className="blue-btn mt-3"
            >
              Reset Password
            </button>

            <p className="text-sm text-center mt-4">
              Back to{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <button
            onClick={() => navigate("/login")}
            className="blue-btn w-full"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
