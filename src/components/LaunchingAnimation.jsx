

import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiCheckCircle } from "react-icons/fi";
import { FaVrCardboard } from "react-icons/fa";

const LaunchingAnimation = ({ isOpen, onClose, onConfirm, mode = "practice" }) => {

    // Stages: animation -> readiness -> success (for VR mode)
    // Stages: video -> readiness -> success (for practice mode)
    const [stage, setStage] = useState("animation");
    const [videoEnded, setVideoEnded] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [checklist, setChecklist] = useState({
        connected: false,
        powered: false,
        clear: false,
        paired: false
    });

    useEffect(() => {
        if (!isOpen) {
            setStage("animation");
            setAnimationComplete(false);
            return;
        }

        if (mode !== "vr") {
            setStage("video");
            setVideoEnded(false);
        } else {
            setStage("animation");
            // Reliability Fallback: Ensure animation completes even if transition event fails
            const timer = setTimeout(() => {
                setAnimationComplete(true);
            }, 5500); // slightly longer than the 5s transition
            return () => clearTimeout(timer);
        }
    }, [isOpen, mode]);

    const handleAnimationEnd = () => {
        setAnimationComplete(true);
        // Stage transition is NOT automatic. We wait for animation to end.
    };

    const proceedToReadiness = () => {
        if (animationComplete || mode !== 'vr') {
            setStage("readiness");
        }
    };

    const handleReadinessNext = () => {
        setStage("success");
    };

    const handleVideoEnd = () => {
        setVideoEnded(true);
    };

    const proceedFromVideo = () => {
        setStage("readiness");
    };

    const handleFinalConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const toggleCheck = (item) => {
        setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const allChecked = Object.values(checklist).every(val => val === true);

    if (!isOpen) return null;

    const title =
        mode === "vr"
            ? "VR Practice"
            : mode === "exercise"
                ? "Exercise"
                : "Practice";


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close"
                >
                    <FiX size={20} />
                </button>

                {/* Content */}
                <div className={(mode === "vr" && stage === "animation") || (mode === "practice" && stage === "video") ? "p-0" : "p-6"}>
                    {/* ========================================
                        VR MODE: ANIMATION STAGE
                    ======================================== */}
                    {/* VR MODE: ANIMATION STAGE (Intro Animation) */}
                    {mode === "vr" && stage === "animation" && (
                        <div className="relative w-full h-[500px] bg-black flex flex-col items-center justify-center overflow-hidden">
                            {/* Professional Intro Animation Container */}
                            <div className="vr-intro-container w-full h-full relative">
                                {/* Grid & Glow Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                                {/* CSS Animation Layers */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 border-2 border-cyan-500/30 rounded-full animate-ping duration-[3000ms]"></div>
                                    <div className="absolute w-48 h-48 border border-white/20 rounded-full animate-reverse-spin duration-[5000ms]"></div>
                                </div>

                                <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center">
                                    <div className="mb-8 relative">
                                        <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl rotate-12 animate-float shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center border border-white/20">
                                            <FaVrCardboard size={64} className="text-white -rotate-12" />
                                        </div>
                                        <div className="absolute -inset-4 bg-cyan-400/20 blur-2xl rounded-full animate-pulse"></div>
                                    </div>

                                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-400 mb-4 tracking-[0.2em] uppercase italic">
                                        Initializing VR
                                    </h1>

                                    <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-[5000ms] ease-linear"
                                            style={{ width: isOpen ? '100%' : '0%' }}
                                            onTransitionEnd={handleAnimationEnd}
                                        ></div>
                                    </div>

                                    <p className="mt-6 text-cyan-300/60 font-mono text-[10px] tracking-widest uppercase animate-pulse">
                                        Mapping Environment & Sensors
                                    </p>
                                </div>

                                {/* Floating HUD Elements */}
                                <div className="absolute top-10 left-10 border-l border-t border-cyan-500/50 w-20 h-20 opacity-40"></div>
                                <div className="absolute bottom-10 right-10 border-r border-b border-cyan-500/50 w-20 h-20 opacity-40"></div>
                            </div>

                            {/* Proceed Button (Only visible when animation ends) */}
                            {animationComplete ? (
                                <div className="absolute bottom-10 left-0 right-0 px-10 animate-bounceIn z-50">
                                    <button
                                        onClick={proceedToReadiness}
                                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl shadow-[0_10px_40px_rgba(255,255,255,0.4)] hover:bg-cyan-50 transition-all active:scale-95 border-2 border-cyan-400"
                                    >
                                        Enter Readiness Console
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAnimationComplete(true)}
                                    className="absolute bottom-4 text-white/30 hover:text-white/60 text-[9px] uppercase tracking-[0.3em] transition-colors"
                                >
                                    Skip Intro (Dev)
                                </button>
                            )}
                        </div>
                    )}

                    {/* ========================================
                        VR MODE: READINESS CONFIRMATION STAGE
                    ======================================== */}
                    {mode === "vr" && stage === "readiness" && (
                        <div className="text-center animate-fadeIn">
                            {/* VR Headset Icon */}
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                                    <svg
                                        className="w-10 h-10"
                                        style={{ color: '#074F06' }}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.74 6H3.26C2.01 6 1 7.01 1 8.26v7.48C1 16.99 2.01 18 3.26 18h4.59l2.1 2.1c.58.58 1.52.58 2.1 0l2.1-2.1h4.59c1.25 0 2.26-1.01 2.26-2.26V8.26C23 7.01 21.99 6 20.74 6zM7.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-bold text-gray-800 mb-2">
                                Are you ready to start VR Practice?
                            </h2>

                            {/* Informational Text */}
                            <p className="text-gray-500 text-[13px] mb-4 leading-relaxed max-w-[320px] mx-auto">
                                Please ensure your VR headset is connected and powered on before starting.
                            </p>

                            {/* Checklist */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 text-left">
                                <h3 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest text-center">
                                    Pre-Launch Checklist
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.connected}
                                                onChange={() => toggleCheck('connected')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.connected && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.connected ? 'text-gray-800' : 'text-gray-400'}`}>
                                            VR headset is connected to your PC
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.powered}
                                                onChange={() => toggleCheck('powered')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.powered && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.powered ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Headset is powered on and functional
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.clear}
                                                onChange={() => toggleCheck('clear')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.clear && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.clear ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Play area is clear and safe
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.paired}
                                                onChange={() => toggleCheck('paired')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.paired && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.paired ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Controllers are charged and paired
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Next Button - Always visible, enabled state depends on checklist */}
                            <div className="mt-6">
                                <button
                                    onClick={allChecked ? handleReadinessNext : null}
                                    disabled={!allChecked}
                                    className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md transform ${allChecked
                                        ? 'bg-[#074F06] text-white hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Proceed to Launch
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        PRACTICE MODE: VIDEO STAGE
                    ======================================== */}
                    {mode === "practice" && stage === "video" && (
                        <div className="relative w-full">
                            {/* Video Player */}
                            <video
                                className="w-full rounded-t-xl"
                                controls
                                autoPlay
                                onEnded={handleVideoEnd}
                                src="/Oculus Setup.mp4"
                            >
                                Your browser does not support the video tag.
                            </video>

                            {/* Proceed Button (visible after video ends or can be clicked anytime) */}
                            {videoEnded && (
                                <div className="p-6 animate-fadeIn">
                                    <button
                                        onClick={proceedFromVideo}
                                        className="w-full bg-[#074F06] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.02]"
                                    >
                                        Continue to Setup Checklist
                                    </button>
                                </div>
                            )}

                            {/* Skip button (always visible) */}
                            {!videoEnded && (
                                <div className="p-6">
                                    <button
                                        onClick={proceedFromVideo}
                                        className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all hover:bg-gray-300"
                                    >
                                        Skip Video
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================
                        PRACTICE MODE: READINESS STAGE
                    ======================================== */}
                    {mode === "practice" && stage === "readiness" && (
                        <div className="text-center animate-fadeIn">
                            {/* Icon */}
                            <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                                    <svg
                                        className="w-10 h-10"
                                        style={{ color: '#074F06' }}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.74 6H3.26C2.01 6 1 7.01 1 8.26v7.48C1 16.99 2.01 18 3.26 18h4.59l2.1 2.1c.58.58 1.52.58 2.1 0l2.1-2.1h4.59c1.25 0 2.26-1.01 2.26-2.26V8.26C23 7.01 21.99 6 20.74 6zM7.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-bold text-gray-800 mb-2">
                                Are you ready to start Practice?
                            </h2>

                            {/* Informational Text */}
                            <p className="text-gray-500 text-[13px] mb-4 leading-relaxed max-w-[320px] mx-auto">
                                Please ensure your VR headset is set up correctly before starting.
                            </p>

                            {/* Checklist */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 text-left">
                                <h3 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest text-center">
                                    Pre-Launch Checklist
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.connected}
                                                onChange={() => toggleCheck('connected')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.connected && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.connected ? 'text-gray-800' : 'text-gray-400'}`}>
                                            VR headset is connected to your PC
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.powered}
                                                onChange={() => toggleCheck('powered')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.powered && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.powered ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Headset is powered on and functional
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.clear}
                                                onChange={() => toggleCheck('clear')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.clear && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.clear ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Play area is clear and safe
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={checklist.paired}
                                                onChange={() => toggleCheck('paired')}
                                                className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-[#074F06] checked:border-[#074F06] transition-all appearance-none cursor-pointer"
                                            />
                                            {checklist.paired && <FiCheck className="absolute left-0.5 text-white pointer-events-none" size={14} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[12px] font-bold transition-colors ${checklist.paired ? 'text-gray-800' : 'text-gray-400'}`}>
                                            Controllers are charged and paired
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Next Button */}
                            <div className="mt-6">
                                <button
                                    onClick={allChecked ? handleReadinessNext : null}
                                    disabled={!allChecked}
                                    className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-md transform ${allChecked
                                        ? 'bg-[#074F06] text-white hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Proceed to Launch
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        SUCCESS STAGE (BOTH MODES)
                    ======================================== */}
                    {stage === "success" && (
                        <div className="text-center animate-fadeIn">
                            {/* Success Icon */}
                            <div className="mb-4 flex justify-center">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center animate-scale-in border border-green-100 shadow-sm">
                                        <FiCheck className="w-8 h-8 text-green-600" strokeWidth={3} />
                                    </div>
                                    <div className="absolute inset-0 w-16 h-16 border-2 border-green-200 rounded-full animate-ping-slow"></div>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-black text-gray-800 mb-1">
                                VR Practice Launched!
                            </h2>

                            <p className="text-[#074F06] font-bold text-sm mb-6">
                                VR application is now active
                            </p>

                            {/* Mandatory Message */}
                            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 mb-8">
                                <p className="text-amber-900 font-bold text-sm leading-relaxed">
                                    The practice application will open on your desktop after confirmation.
                                </p>
                            </div>

                            {/* Final Launch Button */}
                            <button
                                onClick={handleFinalConfirm}
                                className="w-full bg-[#074F06] text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-[0_15px_40px_rgba(7,79,6,0.4)] hover:scale-[1.02] active:scale-95 text-lg"
                            >
                                Got it!
                            </button>
                        </div>
                    )}
                </div>

                {/* Decorative gradient bar at bottom */}
                <div className="h-1 bg-gradient-to-r from-green-600 via-green-800 to-green-900"></div>
            </div>
        </div>
    );
};

export default LaunchingAnimation;
