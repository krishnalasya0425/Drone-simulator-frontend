import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import routeConfig from "../routes/RouteConfig";

export default function Header({ role: propRole }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Get role from prop or localStorage as fallback
    const role = propRole || localStorage.getItem("role");
    const username = localStorage.getItem("name") || "User";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Helper: Get display label for route
    const getRouteLabel = (route) => {
        if (route.label) return route.label;
        const pathName = route.path.replace("/", "") || "Dashboard";
        return pathName.charAt(0).toUpperCase() + pathName.slice(1);
    };

    // Filter routes based on role
    const filteredRoutes = routeConfig.filter(
        (r) => !r.roles || r.roles.includes(role)
    );

    // Paths to exclude from navigation (dynamic routes)
    const excludedPaths = [
        "/forgotpassword",
        "/resetpassword",
        "/:classId/docs",
        "/:classId/generatetest",
        "/:classId/review",
        "/:testId/questions",
        "/:testId/review"
    ];

    // Filter navigation items
    const navRoutes = filteredRoutes.filter((r) => {
        // Exclude dynamic paths
        if (excludedPaths.includes(r.path)) return false;
        // Exclude routes without labels
        if (!r.label && r.path !== '/forgotpassword') return false;

        // For students, hide Classes and Scores from navbar
        if (role === 'Student') {
            if (r.path === '/classes' || r.path === '/scores') {
                return false;
            }
        }

        return true;
    });

    return (
        <header className="w-full bg-gradient-to-r from-[#061E29] via-[#0a2533] to-[#061E29] border-b border-[#00C2C7]/20 shadow-lg relative">
            <div className="max-w-full mx-auto flex items-center justify-between px-8 py-4 relative z-10">
                {/* LEFT SIDE: LOGO & BRAND */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00C2C7] to-[#0099a3] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C2C7]/30 border border-[#00C2C7]/30">
                        <img
                            src="/map-reading-logo-1.png"
                            alt="Map Reading Logo"
                            className="w-full h-full object-contain scale-110"
                        />
                    </div>

                    {/* Brand Name */}
                    <div className="flex flex-col">
                        <span className="font-black text-2xl text-white tracking-tight">
                            Drone Simulator
                        </span>
                        <span className="text-xs font-medium text-[#00C2C7]/60 tracking-wider uppercase">
                            Training Platform
                        </span>
                    </div>
                </div>

                {/* CENTER: NAVIGATION */}
                <nav className="flex items-center gap-2">
                    {navRoutes.map((r, idx) => {
                        const isActive = location.pathname === r.path;
                        const label = getRouteLabel(r);

                        return (
                            <Link
                                key={idx}
                                to={r.path}
                                className={`text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-300 ${isActive
                                    ? 'bg-[#00C2C7]/20 text-[#00C2C7] border border-[#00C2C7]/40 shadow-lg shadow-[#00C2C7]/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* RIGHT SIDE: USER PROFILE + LOGOUT */}
                <div className="flex items-center gap-4">
                    {/* User Profile Badge */}
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-[#00C2C7]/10 border border-[#00C2C7]/30 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00C2C7] to-[#0099a3] rounded-lg flex items-center justify-center">
                            <FaUserCircle size={24} className="text-[#061E29]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-tight">
                                {username}
                            </span>
                            <span className="text-xs font-medium text-[#00C2C7]/60 uppercase tracking-wider leading-tight">
                                {role}
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 font-bold text-sm"
                    >
                        <FiLogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
