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
import TestReview from "../components/TestReview";
import StudentDetails from "../pages/Admin/StudentDetails";

const routesConfig = [
  { path: '/forgotpassword', element: <ForgotPassword /> },
  { path: '/dashboard', element: <AdminDashboard />, roles: ['admin', 'Instructor'], label: 'Dashboard' },
  { path: '/student-dashboard', element: <StudentDashboard />, roles: ['Student'], label: 'Dashboard' },
  { path: '/as', element: <StudentDashboard />, roles: ['Student'] }, // Additional route 
  { path: '/student/:studentId', element: <StudentDetails />, roles: ['admin', 'Instructor'] },
  { path: '/classes', element: <Classes />, roles: ['admin', 'Instructor', 'Student'], label: 'Classes' },
  { path: '/:classId/docs', element: <Docs />, roles: ['admin', 'Instructor', 'Student'] },
  { path: '/:classId/generatetest', element: <GenerateTest />, roles: ['admin', 'Instructor'] },
  { path: '/test-maker', element: <TestMaker />, roles: ['admin', 'Instructor'], label: 'Test Maker' },
  { path: '/:testId/questions', element: <Test />, roles: ['Student'] },
  { path: '/:testId/review', element: <ClassWiseScore />, roles: ['admin', 'Instructor', 'Student'] },
  { path: '/scores', element: <Scoremodal />, roles: ['admin', 'Instructor', 'Student'], label: 'Tests' },
  { path: '/review/:test_set_id/:student_id', element: <TestReview />, roles: ['admin', 'Instructor', 'Student'] },
];

export default routesConfig;