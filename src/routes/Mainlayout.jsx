import React, { useEffect } from "react";
import { useRoutes, useLocation, Navigate } from "react-router-dom";
import RouteConfig from "./RouteConfig";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
 
  const role = localStorage.getItem("role")
  console.log(role)
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

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-black overflow-hidden">
      <Header role = {role}/>
      <div className="flex-grow bg-egreen bg-opacity-5 overflow-auto">
        {routes}
      </div>
    </div>
  );
}
