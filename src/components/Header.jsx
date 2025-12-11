import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import routeConfig from "../routes/RouteConfig"; // adjust path

export default function Header() {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("name") || "User";

  // Filter routes based on role
  const allowedRoutes = routeConfig.filter(
    (route) => !route.roles || route.roles.includes(role)
  );

  return (
    <header className="w-full bg-blue-600 text-white shadow-lg">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT SIDE: LOGO */}
        <div className="flex items-center gap-2 item-start  font-bold text-xl">
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
            className="w-8 h-8"
          />
          <span>Map Reading</span>
        </div>

        {/* CENTER NAVIGATION */}
        <nav className="flex gap-6">
          {allowedRoutes
            .filter((r) => !["/forgotpassword", "/resetpassword","/:classId/docs"].includes(r.path))
            .map((r, idx) => (
              <Link
                key={idx}
                to={r.path}
                className={`text-sm font-medium hover:text-gray-200 ${
                  location.pathname === r.path ? "underline font-semibold" : ""
                }`}
              >
{((r.path.replace("/", "") || "Dashboard")
  .charAt(0).toUpperCase()
  + (r.path.replace("/", "") || "Dashboard['/+").slice(1))}

              </Link>
            ))}
        </nav>

        {/* RIGHT SIDE: PROFILE */}
        <div className="flex items-center item-end gap-2">
          <FaUserCircle size={28} />
          <span className="font-medium">{username}</span>
        </div>
      </div>
    </header>
  );
}
