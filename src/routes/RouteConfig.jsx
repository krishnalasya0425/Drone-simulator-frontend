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
import ContactUs from "../pages/ContactUs";
const routesConfig = [
  { path: '/forgotpassword', element: <ForgotPassword /> },
  { path: '/dashboard', element: <AdminDashboard />, roles: ['admin', 'Instructor'], label: 'Dashboard' },
  { path: '/student-dashboard', element: <StudentDashboard />, roles: ['Student'], label: 'Dashboard' },
  { path: '/as', element: <StudentDashboard />, roles: ['Student'] }, // Additional route 
  { path: '/student/:studentId', element: <StudentDetails />, roles: ['admin', 'Instructor'] },
  { path: '/classes', element: <Classes />, roles: ['admin', 'Instructor', 'Student'], label: 'Classes' },
  { path: '/:classId/docs', element: <Docs />, roles: ['admin', 'Instructor', 'Student'] },
  { path: '/:classId/:studentId/progress', element: <SubtopicsPage />, roles: ['admin', 'Instructor', 'Student'] },
  {
    path: '/:classId/subtopics', element: <Subtopics />, roles: ['admin', 'Instructor']
  },

  { path: '/:classId/generatetest', element: <GenerateTest />, roles: ['admin', 'Instructor'] },
  { path: '/test-maker', element: <TestMaker />, roles: ['Instructor'], label: 'Test Maker' },
  { path: '/:testId/questions', element: <Test />, roles: ['Student'] },
  { path: '/:testId/review', element: <ClassWiseScore />, roles: ['admin', 'Instructor', 'Student'] },
  { path: '/scores', element: <Scoremodal />, roles: ['admin', 'Instructor', 'Student'], label: 'Tests' },
  { path: '/review/:test_set_id/:student_id', element: <TestReview />, roles: ['admin', 'Instructor', 'Student'] },
  // Contact Us route - corrected syntax
  { 
    path: "/contact", 
    element: <ContactUs />,  // Use element, not component
    label: "Contact Us",
    roles: ["admin", "Instructor", "Student"] // Available to all roles
  }
];

export default routesConfig;