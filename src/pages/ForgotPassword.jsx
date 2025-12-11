// ForgotPassword.jsx
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

  const handleRequestOtp = async () => {
    try {
      const res = await api.post("/otp/request", { armyId });
      setMsg("OTP requested. Ask your instructor for the OTP.");
      setStep(2);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Failed to request OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
     await api.post("/otp/reset", { armyId, otp, newPassword });

      setMsg("Password updated successfully! You can login now.");
      setStep(3);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      {msg && <p>{msg}</p>}

      {step === 1 && (
        <>
          <input
            placeholder="Enter your Army ID"
            value={armyId}
            onChange={(e) => setArmyId(e.target.value)}
          />
          <button onClick={handleRequestOtp}>Request OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
        </>
      )}

      {step === 3 && (
        <button onClick={() => (window.location.href = "/login")}>
          Go to Login
        </button>
      )}
    </div>
  );
}