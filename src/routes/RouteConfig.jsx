
import React from "react";
import ForgotPassword from "../pages/ForgotPassword";
import AdminDashboard from "../pages/Admin/AdminDashboard";
// import InstructorDashboard from "../pages/Instructor/InstructorDashboard"
import Classes from "../pages/Instructor/Classes";
import Docs from "../pages/Instructor/Docs";
import Test from "../components/TestQuestions";
import TestMaker from "../components/ParseQuestions";
import StudentDashboard from "../pages/StudentDashboard";
import GenerateTest from "../components/GenerateTest";
import Scoremodal from "../components/Scoremodal";
import ClassWiseScore from "../components/ClassWiseScore";

const routesConfig = [
  // ==================
  // PUBLIC ROUTES
  // ==================
  { path: '/forgotpassword', element: <ForgotPassword /> },

  // ==================
  // DASHBOARD ROUTES
  // ==================
  { path: '/dashboard', element: <AdminDashboard />, roles: ['admin', 'Instructor'], label: 'Dashboard' },
  { path: '/student-dashboard', element: <StudentDashboard />, roles: ['Student'], label: 'Dashboard' },

  // ==================
  // CLASS ROUTES
  // ==================
  { path: '/classes', element: <Classes />, roles: ['admin', 'Instructor', 'Student'], label: 'Classes' },
  { path: '/:classId/docs', element: <Docs />, roles: ['admin', 'Instructor', 'Student'] },
  { path: '/:classId/generatetest', element: <GenerateTest />, roles: ['admin', 'Instructor'] },

  // ==================
  // TEST ROUTES
  // ==================
  { path: '/test-maker', element: <TestMaker />, roles: ['admin', 'Instructor'], label: 'Test Maker' },
  { path: '/:testId/questions', element: <Test />, roles: ['Student'] },
  { path: '/:testId/review', element: <ClassWiseScore />, roles: ['admin', 'Instructor', 'Student'] },

  // ==================
  // SCORE ROUTES
  // ==================
  { path: '/scores', element: <Scoremodal />, roles: ['admin', 'Instructor', 'Student'], label: 'Scores' },
];

export default routesConfig;

