
import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import MainLayout from './Mainlayout';
import { useAuth } from '../context/AuthContext';
import Register from "../pages/Register";
import LandingPage from "../pages/LandingPage";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#070C10] flex items-center justify-center text-cyan-400 font-mono tracking-widest uppercase text-xs">Initializing System...</div>;

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          <Navigate to={user.role?.toLowerCase() === 'student' ? "/student-dashboard" : "/dashboard"} />
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role?.toLowerCase() === 'student' ? "/student-dashboard" : "/dashboard"} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role?.toLowerCase() === 'student' ? "/student-dashboard" : "/dashboard"} /> : <Register />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      {user ? (
        <Route path="/*" element={<MainLayout />} />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;




