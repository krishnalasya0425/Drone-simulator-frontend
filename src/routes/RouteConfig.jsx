import React from "react";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from "../pages/Admin/AdminDashboard";
// import InstructorDashboard from "../pages/Instructor/InstructorDashboard"
import Classes from "../pages/Instructor/Classes";
import Docs from "../pages/Instructor/Docs";
import Test from "../components/TestQuestions";
import TestMaker from "../components/ParseQuestions";
import StudentDashboard from "../pages/StudentDashboard";





const routesConfig = [
  { path: '/forgotpassword', element: <ForgotPassword /> },
  { path: '/resetpassword', element: <ResetPassword /> },

  { path: '/Dashboard', element: <AdminDashboard />, roles: ['admin', 'Instructor'] },
  { path: '/classes', element: <Classes/>, roles: ['admin', 'Instructor'] },
  { path: '/:classId/docs', element: <Docs/>, roles: ['admin', 'Instructor'] },
  { path: '/test', element: <Test/>, roles: ['Student']},
  { path: '/Test', element: <TestMaker/>, roles: ['admin', 'Instructor']},
   { path: '/Dashboard', element: <StudentDashboard/>, roles: ['Student']},


 
];


export default routesConfig;