

import React from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import MainLayout from './Mainlayout';
import { useAuth} from '../context/AuthContext';
import Register from "../pages/Register";


const AppRoutes = () => {
   const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // prevents redirect
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
       <Route path="/register" element={<Register />} />

      {user ? (
        <Route path="/*" element={<MainLayout />} />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;



 