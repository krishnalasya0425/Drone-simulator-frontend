import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiCheckCircle } from "react-icons/fi";

const LaunchingAnimation = ({ isOpen, onClose, mode = "practice" }) => {
    // Stages: animation -> readiness -> success (for VR mode)
    // Stages: loading -> success (for practice mode)
    const [stage, setStage] = useState("animation");
    const [animationEnded, setAnimationEnded] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStage(mode === "vr" ? "animation" : "loading");
            setAnimationEnded(false);
            return;
        }

        // For VR mode, show animation -> readiness -> success
        if (mode === "vr") {
            setStage("animation");
        } else {
            // For practice mode, use original loading behavior
            setStage("loading");
            const timer = setTimeout(() => {
                setStage("success");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, mode]);

    const handleAnimationEnd = () => {
        setAnimationEnded(true);
        // Transition to readiness screen after animation ends
        setTimeout(() => {
            setStage("readiness");
        }, 300);
    };

    const handleReadinessNext = () => {
        // Transition to success screen
        setStage("success");
    };

    if (!isOpen) return null;

    const title = mode === "vr" ? "VR Practice" : "Practice";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-[650px] relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>

                {/* Content */}
                <div className={mode === "vr" && stage === "animation" ? "p-0" : "p-8"}>
                    {/* ========================================
                        VR MODE: ANIMATION STAGE
                    ======================================== */}
                    {mode === "vr" && stage === "animation" && (
                        <div className="relative w-full h-[450px] bg-black flex items-center justify-center overflow-hidden">
                            {/* Professional AR/VR Animation */}
                            <div className="vr-animation-container">
                                {/* Animated Grid Background */}
                                <div className="vr-grid"></div>

                                {/* Floating Holographic Elements */}
                                <div className="vr-hologram vr-hologram-1"></div>
                                <div className="vr-hologram vr-hologram-2"></div>
                                <div className="vr-hologram vr-hologram-3"></div>

                                {/* Additional depth layers */}
                                <div className="vr-depth-layer vr-depth-1"></div>
                                <div className="vr-depth-layer vr-depth-2"></div>

                                {/* Particles */}
                                <div className="vr-particles">
                                    {[...Array(25)].map((_, i) => (
                                        <div key={i} className="vr-particle" style={{
                                            left: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 4}s`,
                                            animationDuration: `${3 + Math.random() * 3}s`
                                        }}></div>
                                    ))}
                                </div>

                                {/* Center VR Icon with pulse */}
                                <div className="vr-center-icon">
                                    <svg
                                        className="w-28 h-28 text-cyan-400 vr-icon-pulse"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.74 6H3.26C2.01 6 1 7.01 1 8.26v7.48C1 16.99 2.01 18 3.26 18h4.59l2.1 2.1c.58.58 1.52.58 2.1 0l2.1-2.1h4.59c1.25 0 2.26-1.01 2.26-2.26V8.26C23 7.01 21.99 6 20.74 6zM7.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                                    </svg>
                                </div>

                                {/* Holographic UI Elements */}
                                <div className="vr-ui-overlay">
                                    <div className="vr-ui-corner vr-ui-top-left"></div>
                                    <div className="vr-ui-corner vr-ui-top-right"></div>
                                    <div className="vr-ui-corner vr-ui-bottom-left"></div>
                                    <div className="vr-ui-corner vr-ui-bottom-right"></div>
                                </div>

                                {/* Professional Loading Text */}
                                <div className="vr-loading-text">
                                    <p className="text-cyan-400 text-2xl font-bold tracking-widest vr-text-glow">
                                        INITIALIZING VR ENVIRONMENT
                                    </p>
                                    <div className="vr-progress-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-advance after animation duration (30 seconds) */}
                            <div
                                className="hidden"
                                ref={(el) => {
                                    if (el && !animationEnded) {
                                        setTimeout(handleAnimationEnd, 10000); // 30 second professional animation
                                    }
                                }}
                            ></div>
                        </div>
                    )}

                    {/* ========================================
                        VR MODE: READINESS CONFIRMATION STAGE
                    ======================================== */}
                    {mode === "vr" && stage === "readiness" && (
                        <div className="text-center animate-fadeIn">
                            {/* VR Headset Icon */}
                            <div className="mb-6 flex justify-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-14 h-14 text-blue-600"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.74 6H3.26C2.01 6 1 7.01 1 8.26v7.48C1 16.99 2.01 18 3.26 18h4.59l2.1 2.1c.58.58 1.52.58 2.1 0l2.1-2.1h4.59c1.25 0 2.26-1.01 2.26-2.26V8.26C23 7.01 21.99 6 20.74 6zM7.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                Are you ready to start VR Practice?
                            </h2>

                            {/* Informational Text */}
                            <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-md mx-auto">
                                Please ensure your VR headset is connected, powered on, and ready for use before starting the practice session.
                            </p>

                            {/* Checklist */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 text-left max-w-md mx-auto">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Pre-Launch Checklist
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">VR headset is connected to your PC</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Headset is powered on and functional</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Play area is clear and safe</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Controllers are charged and paired</span>
                                    </div>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleReadinessNext}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* ========================================
                        PRACTICE MODE: LOADING STAGE
                    ======================================== */}
                    {mode === "practice" && stage === "loading" && (
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg
                                            className="w-10 h-10 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Launching {title}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Preparing your session...
                            </p>
                        </div>
                    )}

                    {/* ========================================
                        SUCCESS STAGE (BOTH MODES)
                    ======================================== */}
                    {stage === "success" && (
                        <div className="text-center animate-fadeIn">
                            {/* Success Icon */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                                        <FiCheck className="w-12 h-12 text-green-600" strokeWidth={3} />
                                    </div>
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-green-300 rounded-full animate-ping-slow"></div>
                                </div>
                            </div>

                            {/* Success Title */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {mode === "vr" ? "VR Practice Launched Successfully!" : "Practice Launched Successfully!"}
                            </h2>

                            {/* Success Message */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 text-blue-700">
                                    <FiCheck className="w-5 h-5" />
                                    <p className="font-medium">
                                        {mode === "vr"
                                            ? "VR application is now running"
                                            : "Practice session is now running"}
                                    </p>
                                </div>
                            </div>

                            {/* Instructions - MANDATORY MESSAGE */}
                            <p className="text-gray-600 text-sm mb-6">
                                The practice application should now be visible on your desktop.
                            </p>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
                            >
                                Got it!
                            </button>
                        </div>
                    )}
                </div>

                {/* Decorative gradient bar at bottom */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            </div>
        </div>
    );
};

export default LaunchingAnimation;
