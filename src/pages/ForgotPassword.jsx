import { useState } from "react";
import api from "../entities/axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiLock, FiKey, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ForgotPassword() {
  const [armyId, setArmyId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    if (!armyId.trim()) {
      setMsg("Please enter your Army ID");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/otp/request", { armyId });
      setMsg("OTP requested successfully! Please ask your instructor for the OTP.");
      setMsgType("success");
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to request OTP. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMsg("Please fill in all fields");
      setMsgType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match");
      setMsgType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMsg("Password must be at least 6 characters long");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/otp/reset", { armyId, otp, newPassword });
      setMsg("Password reset successful!");
      setMsgType("success");
      setStep(3);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to reset password. Please check your OTP.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden" style={{ background: '#061E29' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D546D]/20 via-[#061E29] to-[#5F9598]/20" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#1D546D]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#5F9598]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(95, 149, 152, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(95, 149, 152, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#061E29]/40 backdrop-blur-2xl border border-[#5F9598]/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#5F9598]/40 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#5F9598]/40 rounded-bl-2xl"></div>

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#5F9598] to-[#1D546D]"></div>
                <h1 className="text-2xl font-black text-[#F3F4F4] uppercase tracking-tight">Password Recovery</h1>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5F9598]/70 pl-4">
                {step === 1 && "REQUEST ACCESS CODE"}
                {step === 2 && "VERIFY & RESET"}
                {step === 3 && "RECOVERY COMPLETE"}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-[#5F9598] text-[#061E29]' : 'bg-[#1D546D]/30 text-[#5F9598]/50'}`}>1</div>
                <div className={`h-0.5 w-12 transition-all ${step >= 2 ? 'bg-[#5F9598]' : 'bg-[#1D546D]/30'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-[#5F9598] text-[#061E29]' : 'bg-[#1D546D]/30 text-[#5F9598]/50'}`}>2</div>
                <div className={`h-0.5 w-12 transition-all ${step >= 3 ? 'bg-[#5F9598]' : 'bg-[#1D546D]/30'}`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-[#5F9598] text-[#061E29]' : 'bg-[#1D546D]/30 text-[#5F9598]/50'}`}>3</div>
            </div>

            {/* Message Display */}
            {msg && (
              <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${msgType === 'success' ? 'bg-[#5F9598]/10 border-[#5F9598]/30' :
                  msgType === 'error' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-[#1D546D]/20 border-[#5F9598]/20'
                }`}>
                {msgType === 'success' ? <FiCheckCircle className="text-[#5F9598] flex-shrink-0 mt-0.5" size={18} /> :
                  msgType === 'error' ? <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} /> :
                    <FiAlertCircle className="text-[#5F9598] flex-shrink-0 mt-0.5" size={18} />}
                <p className={`text-sm font-medium ${msgType === 'success' ? 'text-[#5F9598]' :
                    msgType === 'error' ? 'text-red-400' :
                      'text-[#5F9598]'
                  }`}>{msg}</p>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-sans text-[#5F9598] uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <FiMail size={12} />
                    Army ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your Army ID"
                    value={armyId}
                    onChange={(e) => setArmyId(e.target.value)}
                    className="w-full bg-[#1D546D]/20 border border-[#5F9598]/30 rounded-lg px-4 py-3 text-sm text-[#F3F4F4] placeholder:text-[#5F9598]/30 focus:outline-none focus:border-[#5F9598] focus:bg-[#1D546D]/30 transition-all font-sans"
                  />
                </div>

                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#1D546D] to-[#5F9598] text-[#F3F4F4] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:shadow-[#5F9598]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F3F4F4]/30 border-t-[#F3F4F4] rounded-full animate-spin"></div>
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <FiKey size={16} />
                      <span>Request OTP</span>
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-[#5F9598]/10 text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[10px] font-sans text-[#5F9598] hover:text-[#F3F4F4] transition-colors uppercase font-bold flex items-center justify-center gap-2 mx-auto"
                  >
                    <FiArrowLeft size={12} />
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Reset Password */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-sans text-[#5F9598] uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <FiKey size={12} />
                    OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter OTP from instructor"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#1D546D]/20 border border-[#5F9598]/30 rounded-lg px-4 py-3 text-sm text-[#F3F4F4] placeholder:text-[#5F9598]/30 focus:outline-none focus:border-[#5F9598] focus:bg-[#1D546D]/30 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-sans text-[#5F9598] uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <FiLock size={12} />
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1D546D]/20 border border-[#5F9598]/30 rounded-lg px-4 py-3 text-sm text-[#F3F4F4] placeholder:text-[#5F9598]/30 focus:outline-none focus:border-[#5F9598] focus:bg-[#1D546D]/30 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-sans text-[#5F9598] uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <FiLock size={12} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1D546D]/20 border border-[#5F9598]/30 rounded-lg px-4 py-3 text-sm text-[#F3F4F4] placeholder:text-[#5F9598]/30 focus:outline-none focus:border-[#5F9598] focus:bg-[#1D546D]/30 transition-all font-sans"
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#1D546D] to-[#5F9598] text-[#F3F4F4] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:shadow-[#5F9598]/30 transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F3F4F4]/30 border-t-[#F3F4F4] rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={16} />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-[#5F9598]/10 text-center">
                  <button
                    onClick={() => {
                      setStep(1);
                      setMsg("");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-[10px] font-sans text-[#5F9598] hover:text-[#F3F4F4] transition-colors uppercase font-bold flex items-center justify-center gap-2 mx-auto"
                  >
                    <FiArrowLeft size={12} />
                    Request New OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#5F9598]/20 rounded-full flex items-center justify-center mx-auto">
                  <FiCheckCircle className="text-[#5F9598]" size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F3F4F4] mb-2">Password Reset Complete!</h3>
                  <p className="text-sm text-[#5F9598]/70">You can now log in with your new password.</p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-4 bg-gradient-to-r from-[#1D546D] to-[#5F9598] text-[#F3F4F4] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:shadow-[#5F9598]/30 transition-all flex items-center justify-center gap-3"
                >
                  <FiArrowLeft size={16} />
                  <span>Go to Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
