import React, { useEffect, useState } from "react";
import { classAPI } from "../entities/class";
import testAPI from "../entities/test";
import { useNavigate } from "react-router-dom";
import {
  FiBook,
  FiClipboard,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiFileText,
} from "react-icons/fi";
import { FaGraduationCap, FaPencilAlt } from "react-icons/fa";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem("id");
  const studentName = localStorage.getItem("name");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch assigned classes for student
      const classesData = await classAPI.getAllClasses(studentId, "Student");
      setClasses(classesData || []);

      // Fetch available tests for student
      const testsData = await testAPI.getAllTests(studentId, "Student");

      // Transform the data to match the UI requirements
      const transformedTests = (testsData || []).map(test => ({
        id: test.id,
        title: test.title,
        status: test.score !== null ? "completed" : "available",
        // duration: "30 min", // You can add this to backend if needed
        questions: test.total_questions || 0,
        score: test.score ? Math.round((test.score / test.total_questions) * 100) : null
      }));

      setTests(transformedTests);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    navigate(`/${classId}/docs`);
  };

  const handleTestClick = (testId, status) => {
    if (status === "available" || status === "in-progress") {
      navigate(`/${testId}/questions`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#074F06' }}></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-green-50 to-green-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#074F06' }}>
              Welcome back, {studentName}!
            </h1>
            <p className="text-gray-600">
              Continue your map reading training journey
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center px-6 py-3 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="text-2xl font-bold" style={{ color: '#074F06' }}>
                {classes.length}
              </div>
              <div className="text-sm text-gray-700">Enrolled Classes</div>
            </div>
            <div className="text-center px-6 py-3 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="text-2xl font-bold" style={{ color: '#074F06' }}>
                {tests.filter(t => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-700">Tests Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT SIDE - CLASSES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                <FiBook size={28} />
                My Classes
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                {classes.length} {classes.length === 1 ? 'class' : 'classes'}
              </span>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Classes Assigned
                </h3>
                <p className="text-gray-600">
                  You haven't been assigned to any classes yet. Please contact your instructor.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls, index) => (
                  <div
                    key={cls.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 cursor-pointer group"
                    onClick={() => handleClassClick(cls.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md"
                            style={{ backgroundColor: '#074F06' }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 transition-colors"
                              style={{
                                color: 'inherit',
                              }}
                              onMouseEnter={(e) => e.target.style.color = '#074F06'}
                              onMouseLeave={(e) => e.target.style.color = 'inherit'}
                            >
                              {cls.class_name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <FiUsers size={14} />
                              Class ID: {cls.id}
                            </p>
                          </div>
                        </div>
                        <FiArrowRight
                          className="text-gray-400 transition-all"
                          style={{
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#074F06';
                            e.target.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#9ca3af';
                            e.target.style.transform = 'translateX(0)';
                          }}
                          size={24}
                        />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <FiFileText size={16} />
                          <span>View Documents</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiBook size={16} />
                          <span>Study Materials</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="h-1 w-full transition-colors"
                      style={{ backgroundColor: '#D5F2D5' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#074F06'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#D5F2D5'}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - TESTS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                <FiClipboard size={28} />
                Available Tests
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                {tests.length} {tests.length === 1 ? 'test' : 'tests'}
              </span>
            </div>

            {tests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Tests Available
                </h3>
                <p className="text-gray-600">
                  There are no tests available at the moment. Check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 ${test.status === "available" || test.status === "in-progress"
                      ? "cursor-pointer group"
                      : "opacity-90"
                      }`}
                    onClick={() => handleTestClick(test.id, test.status)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800 transition-colors"
                              style={{ color: 'inherit' }}
                              onMouseEnter={(e) => test.status !== "completed" && (e.target.style.color = '#074F06')}
                              onMouseLeave={(e) => e.target.style.color = 'inherit'}
                            >
                              {test.title}
                            </h3>
                            {test.status === "completed" && (
                              <FiCheckCircle style={{ color: '#074F06' }} size={20} />
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              {/* <FiClock size={14} /> */}
                              <span>{test.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiFileText size={14} />
                              <span>{test.questions} questions</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {test.status === "available" && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                                Available
                              </span>
                            )}
                            {test.status === "in-progress" && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                In Progress
                              </span>
                            )}
                            {test.status === "completed" && (
                              <>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                                  Completed
                                </span>
                                <span className="text-sm font-bold" style={{ color: '#074F06' }}>
                                  Score: {test.score}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {(test.status === "available" || test.status === "in-progress") && (
                          <FiArrowRight
                            className="text-gray-400 transition-all"
                            style={{ transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#074F06';
                              e.target.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#9ca3af';
                              e.target.style.transform = 'translateX(0)';
                            }}
                            size={24}
                          />
                        )}
                      </div>

                      {/* Action Button */}
                      {test.status === "available" && (
                        <button
                          className="w-full mt-4 py-2 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: '#074F06' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                        >
                          <FaPencilAlt size={16} />
                          Start Test
                        </button>
                      )}
                      {test.status === "in-progress" && (
                        <button
                          className="w-full mt-4 py-2 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: '#f59e0b' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          <FaPencilAlt size={16} />
                          Continue Test
                        </button>
                      )}
                    </div>

                    <div
                      className="h-1 w-full transition-colors"
                      style={{
                        backgroundColor: test.status === "completed"
                          ? "#074F06"
                          : test.status === "in-progress"
                            ? "#f59e0b"
                            : "#D5F2D5"
                      }}
                      onMouseEnter={(e) => {
                        if (test.status === "available") {
                          e.target.style.backgroundColor = '#074F06';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (test.status === "available") {
                          e.target.style.backgroundColor = '#D5F2D5';
                        }
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
