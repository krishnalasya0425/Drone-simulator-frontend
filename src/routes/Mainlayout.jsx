import React, { useEffect } from "react";
import { useRoutes, useLocation, useNavigate } from "react-router-dom";
import RouteConfig from "./RouteConfig";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {

  const role = localStorage.getItem("role")?.toLowerCase();
  const location = useLocation();
  const navigate = useNavigate();

  // Filter routes based on role
  const allowedRoutes = RouteConfig.filter(
    route => !route.roles || route.roles.includes(role)
  );

  console.log('Role:', role);
  console.log('Allowed routes:', allowedRoutes);
  console.log('Current path:', location.pathname);

  const routes = useRoutes(allowedRoutes);

  const isTestPage = location.pathname.endsWith('/questions');

  return (
    <div className="w-screen h-screen flex flex-col text-[#F3F4F4] overflow-hidden" style={{ background: 'transparent' }}>
      {!isTestPage && <Header role={role} />}
      <div className="flex-grow overflow-auto" style={{ background: 'transparent' }}>
        {routes}
      </div>
    </div>
  );
}
                           