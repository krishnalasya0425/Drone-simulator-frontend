import React, { useEffect } from "react";
import { useRoutes, useLocation, Navigate } from "react-router-dom";
import RouteConfig from "./RouteConfig";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {

  const role = localStorage.getItem("role")

  const location = useLocation();

  // Store last visited page
  useEffect(() => {
    localStorage.setItem("lastPage", location.pathname);
  }, [location]);

  // Filter routes based on role
  const allowedRoutes = RouteConfig.filter(
    route => !route.roles || route.roles.includes(role)
  );

  const routes = useRoutes(allowedRoutes);

  // Check if user is authorized to access route
  const currentRoute = RouteConfig.find(r => r.path === location.pathname);
  const isAuthorized =
    !currentRoute || !currentRoute.roles || currentRoute.roles.includes(role);

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  const isTestPage = location.pathname.endsWith('/questions');

  return (
    <div className="w-screen h-screen flex flex-col text-[#F3F4F4] overflow-hidden" style={{ background: 'transparent' }}>
      {!isTestPage && <Header role={role} />}
      <div className="flex-grow overflow-auto" style={{ background: 'transparent' }}>
        {routes}
      </div>

      {/* Global Corporate Watermark */}
      <div className="fixed bottom-6 right-8 opacity-25 pointer-events-none z-[9999] select-none text-right flex flex-col items-end">
        <img
          src="/edgeforce-logo.png"
          alt="Edgeforce"
          className="h-5 w-auto object-contain mb-1 brightness-150 contrast-125 grayscale"
        />
        {/* <div className="text-[8px] font-black tracking-[0.3em] uppercase text-[#00C2C7] opacity-60">
          Edgeforce Solutions
        </div> */}
      </div>
    </div>
  );
}
