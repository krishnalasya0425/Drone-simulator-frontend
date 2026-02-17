import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShield, FiTarget, FiActivity, FiNavigation, FiZap } from "react-icons/fi";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#070C10] text-[#E6F1F5] font-sans overflow-x-hidden">
            {/* 1. Background Visuals */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Animated Gradient Background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #070C10 0%, #0a1520 25%, #061E29 50%, #0a1520 75%, #070C10 100%)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientShift 15s ease infinite'
                    }}
                ></div>

                {/* Depth Vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 30%, rgba(7, 12, 16, 0.8) 100%)'
                    }}
                ></div>

                {/* Technical HUD Grid */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0, 194, 199, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 194, 199, 0.1) 1px, transparent 1px)',
                            backgroundSize: '80px 80px'
                        }}
                    ></div>
                </div>
            </div>

            {/* 2. Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-8 md:px-16 bg-[#070C10]/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-cyan-400"></div>
                    <span className="text-xl font-black uppercase tracking-tighter">Drone Simulator</span>
                </div>
                <div className="flex items-center gap-8">
                    <a href="#features" className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-cyan-400 transition-colors">Capabilities</a>
                    <a href="#tech" className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-cyan-400 transition-colors">Tech Stack</a>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 border border-cyan-400/30 rounded-lg text-[11px] font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-400/10 transition-all flex items-center gap-2 group"
                    >
                        Enter System
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* 3. Hero Section */}
            <section className="relative pt-40 pb-32 lg:pb-64 px-8 flex flex-col items-center justify-center text-center min-h-screen">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto animate-[fadeInUp_1s_ease-out]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">Next-Gen Simulation v4.0</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                        Pioneering the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-700">Skies of Tomorrow</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#8FA8B3] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        Ultra-realistic VR environment for military-grade drone piloting, navigation, and reconnaissance training. Precision engineering meets virtual reality.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 lg:hidden">
                        <button
                            onClick={() => navigate('/register')}
                            className="px-10 py-4 bg-cyan-500 text-[#070C10] font-black text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all active:scale-95"
                        >
                            Request Access
                        </button>
                    </div>
                </div>

                {/* 4. Unified Mission Briefing / Stats Dock */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-8 hidden lg:block">
                    <div className="relative group">
                        {/* Glowing Background Accent */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/20 blur-xl opacity-50"></div>

                        <div className="relative flex items-stretch bg-[#070C10]/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Stats Section 1 */}
                            <div className="flex flex-1 items-center justify-around py-6 px-4">
                                {[
                                    { label: 'Latency', value: '0.2MS', icon: <FiActivity /> },
                                    { label: 'Resolution', value: '8K VR', icon: <FiNavigation /> },
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105 duration-300">
                                        <div className="text-cyan-400/70 text-sm">{stat.icon}</div>
                                        <span className="text-[9px] uppercase tracking-widest text-[#8FA8B3] font-bold">{stat.label}</span>
                                        <span className="text-lg font-black text-white">{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Centered CTA Section */}
                            <div className="flex flex-none items-center px-12 bg-white/5 border-x border-white/10 relative overflow-hidden group/cta">
                                <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover/cta:opacity-5 transition-opacity duration-500"></div>
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="px-12 py-4 bg-cyan-500 text-[#070C10] font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all active:scale-95 z-10"
                                    >
                                        Request Access
                                    </button>
                                    <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-cyan-400 transition-colors z-10 flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-white/20"></span>
                                        View Specs
                                        <span className="w-4 h-[1px] bg-white/20"></span>
                                    </button>
                                </div>
                            </div>

                            {/* Stats Section 2 */}
                            <div className="flex flex-1 items-center justify-around py-6 px-4">
                                {[
                                    { label: 'Area Covered', value: '450KM²', icon: <FiTarget /> },
                                    { label: 'Uptime', value: '99.9%', icon: <FiZap /> }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105 duration-300">
                                        <div className="text-cyan-400/70 text-sm">{stat.icon}</div>
                                        <span className="text-[9px] uppercase tracking-widest text-[#8FA8B3] font-bold">{stat.label}</span>
                                        <span className="text-lg font-black text-white">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technical HUD Accents */}
                        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-3xl -z-10 group-hover:border-cyan-500/40 transition-colors"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20 rounded-br-3xl -z-10 group-hover:border-cyan-500/40 transition-colors"></div>
                    </div>
                </div>
            </section>

            {/* 4. Features Section */}
            <section id="features" className="relative py-32 px-8 bg-[#070C10]/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.3em] mb-4">// Operational Capabilities</h2>
                            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Engineered for Precision</h3>
                        </div>
                        <div className="text-right text-[#8FA8B3] uppercase text-[10px] tracking-widest font-bold">
                            Mission Set A-04 <br /> Tactical Simulation Suite
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'VR Reconnaissance',
                                desc: 'Full immersive environments for strategic asset identification and mapping using next-gen photogrammetry.',
                                icon: <FiTarget size={24} />,
                                image: 'https://i.pinimg.com/1200x/90/44/a2/9044a20f7678b7adeb70b96213ceb867.jpg'
                            },
                            {
                                title: 'Real-time Telemetry',
                                desc: 'Advanced data streaming with millisecond precision. Monitor every aspect of flight through technical dashboarding.',
                                icon: <FiActivity size={24} />,
                                image: 'https://i.pinimg.com/736x/df/84/cb/df84cb9114ee9c63f23dfc9702cb3b5f.jpg'
                            },
                            {
                                title: 'Protected Network',
                                desc: 'Enterprise-grade encryption for all mission data. Access controlled through multi-factor authentication protocols.',
                                icon: <FiShield size={24} />,
                                image: 'https://i.pinimg.com/736x/a6/eb/be/a6ebbea28b6d2c431512aaf6079102a0.jpg'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative h-[450px] rounded-2xl overflow-hidden border border-white/5 bg-white/5 transition-all hover:border-cyan-400/50"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-30 group-hover:opacity-50"
                                    style={{ backgroundImage: `url(${feature.image})` }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-[#070C10]/20 via-transparent to-[#070C10] p-8 flex flex-col justify-end">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/30">
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">{feature.title}</h4>
                                    <p className="text-sm text-[#8FA8B3] leading-relaxed transition-colors group-hover:text-white/80">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. System Status (Minimal Footer) */}
            <footer className="relative py-20 px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-cyan-400"></div>
                            <span className="text-lg font-black uppercase tracking-tighter">Drone Simulator HQ</span>
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">© 2026 Advanced Tactical Simulation Systems. All Rights Reserved.</p>
                    </div>

                    <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-[#8FA8B3]">
                        <a href="#" className="hover:text-cyan-400">Security Dept</a>
                        <a href="#" className="hover:text-cyan-400">API Docs</a>
                        <a href="#" className="hover:text-cyan-400">Terms of Ops</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex h-10 px-4 items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Global Servers: Online</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
        </div>
    );
}
