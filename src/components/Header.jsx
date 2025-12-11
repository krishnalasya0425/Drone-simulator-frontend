import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import routeConfig from "../routes/RouteConfig";

export default function Header() {
  const location = useLocation();
  const { logout } = useAuth();

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("name") || "User";

  // Helper: Capitalize path
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Filter routes based on role
  const allowedRoutes = routeConfig.filter(
    (route) => !route.roles || route.roles.includes(role)
  );

  return (
    <header className="w-full bg-blue-600 text-white shadow-lg">
      <div className="max-w-full mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT SIDE: LOGO */}
        <div className="flex items-center justify-start gap-2 font-bold text-xl ">
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
            className="w-8 h-8"
          />
          <span>Map Reading</span>
        </div>

        {/* CENTER NAVIGATION */}
        <nav className="flex justify-center gap-4 ">
          {allowedRoutes
            .filter(
              (r) =>
                ![
                  "/forgotpassword",
                  "/resetpassword",
                  "/:classId/docs",
                ].includes(r.path)
            )
            .map((r, idx) => {
              const pathName = r.path.replace("/", "") || "Dashboard";
              const label = capitalize(pathName);

              const isActive = location.pathname === r.path;

              return (
                <Link
                  key={idx}
                  to={r.path}
                  className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${
                    isActive
                      ? "bg-white text-blue-600 font-semibold shadow-md"
                      : "hover:text-gray-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
        </nav>

        {/* RIGHT SIDE: PROFILE + LOGOUT */}
        <div className="flex items-center justify-end gap-4 ">
          <div className="flex items-center gap-2">
            <FaUserCircle size={26} />
            <span className="font-medium">{username}</span>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={logout}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}
