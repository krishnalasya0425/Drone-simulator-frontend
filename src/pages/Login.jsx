import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import { FiEye, FiEyeOff, FiUser, FiLock, FiArrowRight } from "react-icons/fi";

const Login = () => {
    const [armyNo, setArmyNo] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

    const { login } = useAuth();
    const navigate = useNavigate();

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = await login(armyNo, password);
            const redirectPath = userData.role === "Student" ? "/student-dashboard" : "/dashboard";
            navigate(redirectPath);
        } catch (err) {
            setModal({
                isOpen: true,
                title: "Authentication Failed",
                message: err.message || "Login failed. Please check your credentials.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans" style={{ background: '#070C10' }}>
            <InfoModal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} />

            {/* 1. Background with Vignette */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://i.pinimg.com/736x/85/44/31/854431126752c3fa6cf32166965a1637.jpg)', opacity: '0.35', filter: 'grayscale(0.3)' }}
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
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/85/44/31/854431126752c3fa6cf32166965a1637.jpg)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a1923]/80"></div>
                </div>

                <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[#5F9598]"></div>
                            <h1 className="text-2xl font-black text-[#E6F1F5] uppercase tracking-tighter">Mission Control</h1>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5F9598]/60 pl-4">SECURE ACCESS GATEWAY</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Authentication ID</label>
                            <input
                                type="text"
                                placeholder="ARMY NUMBER"
                                value={armyNo}
                                onChange={(e) => setArmyNo(e.target.value)}
                                required
                                className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 focus:bg-[#0a1923]/60 transition-all font-sans"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[9px] font-sans text-white/50 uppercase tracking-widest block mb-1.5">Access Key</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-[#0a1923]/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[#5F9598]/50 font-sans"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-white/20 hover:text-[#5F9598]"
                            >
                                {showPassword ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/forgotpassword")}
                                className="text-[9px] font-sans text-white/30 hover:text-[#5F9598] transition-colors italic"
                            >
                // Forgotten Credentials?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#5F9598] text-[#070C10] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-[#1D546D] hover:shadow-[0_0_25px_rgba(95,149,152,0.4)] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#070C10]/30 border-t-[#070C10] rounded-full animate-spin"></div>
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Initialize System</span>
                                    <FiArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <span className="text-[9px] font-sans text-white/20 uppercase mr-3">// No Clearance Yet?</span>
                        <a href="/register" className="text-[10px] font-sans text-[#5F9598] hover:text-[#F3F4F4] transition-colors uppercase font-bold underline decoration-[#5F9598]/30 underline-offset-4">Request Access</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
