
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RouteConfig from "../routes/RouteConfig";
import { useAuth } from "../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

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

    // Helper: Capitalize path for display
    const capitalize = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1);

    // Filter routes based on role and exclude dynamic paths
    const filteredRoutes = RouteConfig.filter(
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

    return (
        <header className="w-full text-white shadow-lg" style={{ backgroundColor: '#074F06' }}>
            <div className="max-w-full mx-auto flex items-center justify-between px-6 py-3">

                {/* LEFT SIDE: MAP READING */}
                <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="white" />
                        <path d="M20 10C16.134 10 13 13.134 13 17C13 22.25 20 30 20 30C20 30 27 22.25 27 17C27 13.134 23.866 10 20 10ZM20 19.5C18.619 19.5 17.5 18.381 17.5 17C17.5 15.619 18.619 14.5 20 14.5C21.381 14.5 22.5 15.619 22.5 17C22.5 18.381 21.381 19.5 20 19.5Z" fill="#074F06" />
                    </svg>
                    <span className="font-bold text-xl">Map Reading</span>
                </div>

                {/* CENTER: NAV LINKS */}
                <nav className="flex items-center gap-2">
                    {filteredRoutes
                        .filter((r) => {
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
                        })
                        .map((r, idx) => {
                            const isActive = location.pathname === r.path;
                            // Use explicit label or capitalize the path
                            const label = r.label || capitalize(r.path.replace("/", "") || "Dashboard");

                            return (
                                <Link
                                    key={idx}
                                    to={r.path}
                                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-white font-semibold shadow-md nav-link-active"
                                        : "nav-link-inactive hover:shadow-md"
                                        }`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                </nav>

                {/* RIGHT SIDE: USERNAME + LOGOUT */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                        <FaUserCircle size={20} className="text-white" />
                        <span className="text-sm font-medium text-white">{username}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
                        style={{ color: '#074F06' }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#D5F2D5';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                        }}
                    >
                        <FiLogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
