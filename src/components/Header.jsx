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
        <header className="w-full text-white shadow-lg" style={{ backgroundColor: '#074F06' }}>
            <div className="max-w-full mx-auto flex items-center justify-between px-6 py-3.5">

                {/* LEFT SIDE: LOGO & BRAND */}
                <div className="flex items-center gap-3">
                    {/* Logo Icon */}
                             <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm">
    <img
      src="/map-reading-logo-1.png"
      alt="Map Reading Logo"
      className="w-full h-full object-contain scale-110 transform -translate-y-1"
    />
  </div>



                    {/* Brand Name */}
                    <div className="flex flex-col">
                        <span className="font-bold text-xl leading-tight">Map Reading</span>
                        <span className="text-xs text-white text-opacity-80 leading-tight">Training Platform</span>
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
                                className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-white font-bold shadow-md nav-link-active"
                                    : "nav-link-inactive hover:bg-white hover:bg-opacity-10"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: isActive ? '#074F06' : 'white'
                                }}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* RIGHT SIDE: USER PROFILE + LOGOUT */}
                <div className="flex items-center gap-4">
                    {/* User Profile Badge */}
                    <div
                        className="flex items-center gap-3 px-4 py-1.5 rounded-xl backdrop-blur-md border border-white/30 shadow-sm"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                            <FaUserCircle size={24} style={{ color: '#074F06' }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-tight tracking-tight">{username}</span>
                            <span className="text-[10px] text-white/80 leading-tight uppercase font-black tracking-widest">{role}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm bg-white px-4 py-2.5 rounded-lg transition-all font-semibold shadow-sm hover:shadow-md group"
                        style={{ color: '#074F06' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#D5F2D5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        <FiLogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
