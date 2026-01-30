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
  FiDownload,
  FiEye,
} from "react-icons/fi";
import { FaGraduationCap, FaPencilAlt, FaBook, FaImage, FaVideo } from "react-icons/fa";
import progressAPI from "../entities/progress";
import ProgressBar from "../components/ProgressBar";
import retestAPI from "../entities/retest";
import { FiRefreshCcw } from "react-icons/fi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [classesProgress, setClassesProgress] = useState([]);
  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [retestRequests, setRetestRequests] = useState([]);
  const [requestingId, setRequestingId] = useState(null);
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

      // Fetch progress for those classes
      const progressRes = await progressAPI.getStudentAllClassesProgress(studentId);
      if (progressRes.data.success) {
        setClassesProgress(progressRes.data.data);
      }

      // Fetch available tests for student
      const testsData = await testAPI.getAllTests(studentId, "Student");

      // Fetch retest requests
      const retestRes = await retestAPI.getStudentRequests(studentId);
      setRetestRequests(retestRes.data || []);

      // Transform the data to match the UI requirements
      const transformedTests = (testsData || []).map(test => ({
        id: test.id,
        test_set_id: test.test_set_id,
        test_id: test.test_id,
        title: test.title || test.test_title,
        status: test.score !== null ? "completed" : "available",
        score: test.score !== null ? test.score : null,
        total_questions: test.total_questions || 0,
        exam_type: test.exam_type,
        duration: test.duration_minutes,
        start_time: test.start_time,
        end_time: test.end_time,
        class_id: test.class_id,
        submitted_at: test.submitted_at
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

  const handleTestClick = (testId, testSetId, status) => {
    if (status === "available" || status === "in-progress") {
      navigate(`/${testSetId || testId}/questions`);
    }
  };

  const handleRetestRequest = async (test) => {
    try {
      setRequestingId(test.id);

      const response = await retestAPI.requestRetest({
        student_id: studentId,
        class_id: test.class_id,
        test_id: test.test_id,
        score: test.score,
        total_questions: test.total_questions,
        attempted_at: test.submitted_at
      });

      // Refresh dashboard data to show the new request
      await loadDashboardData();

      alert("✅ Retest request submitted successfully! Your instructor will review it soon.");
    } catch (err) {
      console.error("Retest request failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit retest request";
      alert(`❌ ${errorMessage}`);
    } finally {
      setRequestingId(null);
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
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#074F06' }}>
              Welcome back, {studentName}!
            </h1>
            <p className="text-xs text-gray-500">
              Continue your map reading training journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-1.5 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="text-lg font-bold" style={{ color: '#074F06' }}>
                {classes.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-700">Enrolled Classes</div>
            </div>
            <div className="text-center px-4 py-1.5 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="text-lg font-bold" style={{ color: '#074F06' }}>
                {tests.filter(t => t.status === "completed").length} / {tests.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-700">Tests Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT SIDE - CLASSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                <FiBook size={20} />
                My Classes
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
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
                {classes.map((cls, index) => {
                  const progress = classesProgress.find(p => p.class_id === cls.id);
                  return (
                    <div
                      key={cls.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 cursor-pointer group"
                      onClick={() => handleClassClick(cls.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{ backgroundColor: '#074F06' }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-800 group-hover:text-[#074F06] transition-colors">
                                {cls.class_name}
                              </h3>
                              {progress && (
                                <p className="text-[10px] font-semibold text-gray-400">
                                  {progress.completed_documents}/{progress.total_documents} items completed
                                </p>
                              )}
                            </div>
                          </div>
                          <FiArrowRight
                            className="text-gray-400 group-hover:text-[#074F06] group-hover:translate-x-1 transition-all"
                            size={20}
                          />
                        </div>

                        {/* Minimal Progress Section */}
                        {progress && (
                          <div className="mt-4 pt-3 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Progress</span>
                              <span className="text-xs font-bold text-[#074F06]">
                                {parseFloat(progress.overall_completion_percentage || 0).toFixed(0)}%
                              </span>
                            </div>
                            <ProgressBar
                              percentage={parseFloat(progress.overall_completion_percentage || 0)}
                              showLabel={false}
                              height="h-1.5"
                            />

                            {/* Detailed micro-stats */}
                            <div className="flex items-center gap-3 mt-2 opacity-70">
                              <div className="flex items-center gap-1">
                                <FaBook size={10} className="text-red-500" />
                                <span className="text-[9px] font-bold text-gray-600">{Math.round(progress.pdf_completion_percentage)}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaImage size={10} className="text-blue-500" />
                                <span className="text-[9px] font-bold text-gray-600">{Math.round(progress.image_completion_percentage)}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaVideo size={10} className="text-purple-500" />
                                <span className="text-[9px] font-bold text-gray-600">{Math.round(progress.video_completion_percentage)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className="h-1 w-full transition-colors"
                        style={{ backgroundColor: progress?.overall_completion_percentage >= 100 ? '#074F06' : '#D5F2D5' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#074F06'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = progress?.overall_completion_percentage >= 100 ? '#074F06' : '#D5F2D5'}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - TESTS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                <FiClipboard size={20} />
                Available Tests
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold border-2 outline-none cursor-pointer transition-all"
                  style={{
                    borderColor: '#074F06',
                    color: '#074F06',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="all">All Tests</option>
                  <option value="completed">Completed</option>
                  <option value="unattempted">Unattempted</option>
                </select>
                <span className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                  {tests.filter(t => {
                    if (filter === "completed") return t.status === "completed";
                    if (filter === "unattempted") return t.status !== "completed";
                    return true;
                  }).length} results
                </span>
              </div>
            </div>

            {tests.filter(t => {
              if (filter === "completed") return t.status === "completed";
              if (filter === "unattempted") return t.status !== "completed";
              return true;
            }).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No {filter !== "all" ? filter : ""} Tests Found
                </h3>
                <p className="text-gray-600">
                  {filter === "completed"
                    ? "You haven't completed any tests yet."
                    : filter === "unattempted"
                      ? "Great job! You have no pending tests."
                      : "There are no tests available at the moment."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests
                  .filter(t => {
                    if (filter === "completed") return t.status === "completed";
                    if (filter === "unattempted") return t.status !== "completed";
                    return true;
                  })
                  .map((test) => (
                    <div
                      key={test.id}
                      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 ${test.status === "available" || test.status === "in-progress"
                        ? "cursor-pointer group"
                        : "opacity-90"
                        }`}
                      onClick={() => handleTestClick(test.id, test.test_set_id, test.status)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-gray-800 transition-colors"
                                style={{ color: 'inherit' }}
                                onMouseEnter={(e) => test.status !== "completed" && (e.target.style.color = '#074F06')}
                                onMouseLeave={(e) => e.target.style.color = 'inherit'}
                              >
                                {test.title}
                              </h3>
                              {test.status === "completed" && (
                                <FiCheckCircle style={{ color: '#074F06' }} size={16} />
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <FiFileText size={14} />
                                <span>{test.total_questions} questions</span>
                              </div>

                              {test.exam_type && (
                                <div className="flex items-center gap-1 font-bold" style={{ color: '#074F06' }}>
                                  <FiClock size={14} />
                                  <span>{test.exam_type.replace('_', ' ')}</span>
                                </div>
                              )}

                              {test.exam_type === "TIMED" && test.duration && (
                                <div className="flex items-center gap-1">
                                  <FiClock size={14} />
                                  <span>{test.duration} mins</span>
                                </div>
                              )}
                            </div>



                            {/* Status Badge & Retest Logic */}
                            <div className="flex flex-wrap items-center gap-2">
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
                                <div className="flex flex-col gap-3 mt-1 w-full">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                                      Completed
                                    </span>
                                    <span className="text-sm font-bold" style={{ color: '#074F06' }}>
                                      Score: {test.score} / {test.total_questions}
                                    </span>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/review/${test.test_set_id}/${studentId}`);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border shadow-sm hover:shadow-md hover:bg-gray-50"
                                        style={{
                                          backgroundColor: 'white',
                                          color: '#074F06',
                                          borderColor: '#074F06'
                                        }}
                                      >
                                        <FiEye size={14} />
                                        View Result
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/download/${test.test_set_id}/${studentId}`, "_blank");
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border shadow-sm hover:shadow-md hover:bg-gray-50"
                                        style={{
                                          backgroundColor: 'white',
                                          color: '#074F06',
                                          borderColor: '#074F06'
                                        }}
                                        title="Download Performance Report"
                                      >
                                        <FiDownload size={14} />
                                        Download
                                      </button>
                                    </div>
                                  </div>

                                  {/* RETEST REQUEST LOGIC */}
                                  {(() => {
                                    const scorePercent = (test.score / test.total_questions) * 100;
                                    const classProgress = classesProgress.find(p => p.class_id === test.class_id);
                                    const isProgressDone = classProgress && parseFloat(classProgress.overall_completion_percentage) >= 99.9;
                                    const existingRequest = retestRequests.find(r => r.test_id === test.test_id);

                                    if (scorePercent < 50 && isProgressDone) {
                                      if (existingRequest) {
                                        return (
                                          <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold ${existingRequest.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            existingRequest.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                              'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            <FiRefreshCcw size={14} className={existingRequest.status === 'Pending' ? 'animate-spin-slow' : ''} />
                                            Retest Request: {existingRequest.status}
                                            {existingRequest.status === 'Approved' && " - Your instructor has granted a retest."}
                                          </div>
                                        );
                                      }

                                      return (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRetestRequest(test);
                                          }}
                                          disabled={requestingId === test.id}
                                          className="flex items-center justify-center gap-2 w-fit px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                          {requestingId === test.id ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                            <FiRefreshCcw size={14} />
                                          )}
                                          Request Retest (Score &lt; 50%)
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
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
