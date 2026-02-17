import { useState } from "react";
import api from "../entities/axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail, FiAward, FiArrowRight } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "", armyNo: "", rank: "", customRank: "", role: "", courseNo: "", password: "", confirmPassword: "",
  });

  const handleRankChange = (e) => {
    const selectedRank = e.target.value;
    setFormData({ ...formData, rank: selectedRank, customRank: selectedRank === "Others" ? formData.customRank : "" });
  };

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const closeModal = () => { setModal(prev => ({ ...prev, isOpen: false })); if (modal.type === "success") navigate("/login"); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModal({ isOpen: true, title: "Password Mismatch", message: "Passwords do not match.", type: "error" });
      return;
    }
    const finalRank = formData.rank === "Others" ? formData.customRank : formData.rank;
    try {
      await api.post("/auth/register", {
        name: formData.name,
        army_no: formData.armyNo,
        rank: finalRank,
        role: formData.role,
        course_no: formData.courseNo,
        password: formData.password
      });
      setModal({ isOpen: true, title: "Request Sent", message: "Registration successful. Pending admin approval.", type: "success" });
    } catch (err) {
      setModal({ isOpen: true, title: "Failed", message: err.response?.data?.message || err.message, type: "error" });
    }
  };

  const ranks = ["Sepoy (Sep)", "Naik (Nk)", "Havildar (Hav)", "Naib Subedar (Nb Sub)", "Subedar (Sub)", "Subedar Major (Sub Maj)", "Lieutenant (Lt)", "Captain (Capt)", "Major (Maj)", "Lieutenant Colonel (Lt Col)", "Colonel (Col)", "Others"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans" style={{ background: '#070C10' }}>
      <InfoModal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} />

      {/* 1. Background with Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://i.pinimg.com/736x/a6/eb/be/a6ebbea28b6d2c431512aaf6079102a0.jpg)', opacity: '0.35', filter: 'grayscale(0.3)' }}
      ></div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 20%, rgba(7, 12, 16, 0.95) 100%)' }}></div>

      {/* 2. HUD Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(95, 149, 152, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(95, 149, 152, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      {/* 3. Container */}
      <div className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex max-h-[90vh]" style={{ background: 'rgba(10, 25, 35, 0.4)', backdropFilter: 'blur(25px)', border: '1px solid rgba(95, 149, 152, 0.15)' }}>

        {/* Decorative accents */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#5F9598]/30 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#5F9598]/30 rounded-bl-2xl"></div>

        <div className="hidden md:block md:w-[40%] relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/a6/eb/be/a6ebbea28b6d2c431512aaf6079102a0.jpg)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a1923]/80"></div>
        </div>

        <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-[#5F9598]"></div>
              <h1 className="text-2xl font-black text-[#E6F1F5] uppercase tracking-tighter">Mission Enrollment</h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5F9598]/60 pl-4">SECURE REQUEST GATEWAY</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Full Name</label>
                <input type="text" name="name" placeholder="IDENTIFIER" value={formData.name} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 focus:bg-[#0a1923]/60 transition-all font-sans" />
              </div>
              <div>
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Army Number</label>
                <input type="text" name="armyNo" placeholder="REG-ID" value={formData.armyNo} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 focus:bg-[#0a1923]/60 transition-all font-sans" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">User Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#5F9598]/50 appearance-none font-sans">
                  <option value="">SELECT ROLE</option>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Service Rank</label>
                <select name="rank" value={formData.rank} onChange={handleRankChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#5F9598]/50 appearance-none font-sans">
                  <option value="">RANK SELECT</option>
                  {ranks.map((r, i) => <option key={i} value={r} className="bg-[#0a1923]">{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Course No</label>
              <input type="text" name="courseNo" placeholder="CN-XXX" value={formData.courseNo} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 focus:bg-[#0a1923]/60 transition-all font-sans" />
            </div>

            {formData.rank === "Others" && (
              <input type="text" name="customRank" placeholder="SPECIFY RANK" value={formData.customRank} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5F9598]/50 font-sans transition-all" />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Access Key</label>
                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 font-sans" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-white/20 hover:text-[#5F9598]"><FiEye size={12} /></button>
              </div>
              <div className="relative">
                <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Retype Key</label>
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 font-sans" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-white/20 hover:text-[#5F9598]"><FiEye size={12} /></button>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[#5F9598] text-[#070C10] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-[#1D546D] hover:shadow-[0_0_25px_rgba(95,149,152,0.4)] transition-all flex items-center justify-center gap-3 mt-4">
              <span>Submit for Clearance</span>
              <FiArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-[9px] font-sans text-white/20 uppercase mr-3">// Clearance Already Granted?</span>
            <a href="/login" className="text-[10px] font-sans text-[#5F9598] hover:text-[#F3F4F4] transition-colors uppercase font-bold underline decoration-[#5F9598]/30 underline-offset-4">Return to HQ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
