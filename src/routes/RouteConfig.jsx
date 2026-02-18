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
import Subtopics from "../components/Subtopics";
import SubtopicsPage from "../components/SubtopicsPageProgress";

const routesConfig = [
  { path: '/forgotpassword', element: <ForgotPassword /> },
  { path: '/dashboard', element: <AdminDashboard />, roles: ['admin', 'instructor'], label: 'Dashboard' },
  { path: '/student-dashboard', element: <StudentDashboard />, roles: ['student'], label: 'Dashboard' },
  { path: '/as', element: <StudentDashboard />, roles: ['student'] }, // Additional route 
  { path: '/student/:studentId', element: <StudentDetails />, roles: ['admin', 'instructor'] },
  { path: '/classes', element: <Classes />, roles: ['admin', 'instructor', 'student'], label: 'Classes' },
  { path: '/:classId/docs', element: <Docs />, roles: ['admin', 'instructor', 'student'] },
  { path: '/:classId/:studentId/progress', element: <SubtopicsPage />, roles: ['admin', 'instructor', 'student'] },
  {
    path: '/:classId/subtopics', element: <Subtopics />, roles: ['admin', 'instructor']
  },

  { path: '/:classId/generatetest', element: <GenerateTest />, roles: ['admin', 'instructor'] },
  { path: '/test-maker', element: <TestMaker />, roles: ['instructor'], label: 'Test Maker' },
  { path: '/:testId/questions', element: <Test />, roles: ['student'] },
  { path: '/:testId/review', element: <ClassWiseScore />, roles: ['admin', 'instructor', 'student'] },
  { path: '/scores', element: <Scoremodal />, roles: ['admin', 'instructor', 'student'], label: 'Tests' },
  { path: '/review/:test_set_id/:student_id', element: <TestReview />, roles: ['admin', 'instructor', 'student'] },
];

export default routesConfig;