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
  FiFileText,
  FiEye,
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import progressAPI from "../entities/progress";
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
  const [activeTab, setActiveTab] = useState("overview");
  const studentId = localStorage.getItem("id");
  const studentName = localStorage.getItem("name");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const classesData = await classAPI.getAllClasses(studentId, "Student");
      setClasses(classesData || []);

      const progressRes = await progressAPI.getStudentAllClassesProgress(studentId);
      if (progressRes.data.success) {
        setClassesProgress(progressRes.data.data);
      }

      const testsData = await testAPI.getAllTests(studentId, "Student");

      const retestRes = await retestAPI.getStudentRequests(studentId);
      setRetestRequests(retestRes.data || []);

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
      await retestAPI.requestRetest({
        student_id: studentId,
        class_id: test.class_id,
        test_id: test.test_id,
        score: test.score,
        total_questions: test.total_questions,
        attempted_at: test.submitted_at
      });
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#061E29]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C2C7]/20 via-transparent to-[#0a2533]/80" />
        <div className="relative z-10 glass-container p-12 text-center border border-[#00C2C7]/30 backdrop-blur-3xl">
          <div className="loading-spinner mx-auto mb-6"></div>
          <p className="text-[#F3F4F4] text-2xl font-black uppercase italic tracking-widest animate-pulse">Initializing HUD...</p>
        </div>
      </div>
    );
  }

  const completedTests = tests.filter(t => t.status === "completed").length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#061E29]">
      {/* Live Animated Background */}
      <div className="fixed inset-0">
        {/* Background Image with 25% opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/39/a3/35/39a3359710ee24c66c8ef1a82c47ae46.jpg)',
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C2C7]/10 via-transparent to-[#0a2533]/80 animate-gradient-slow" />
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tab Navigation - Floating */}
          {/*
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="flex gap-2 bg-[#1D546D]/30 backdrop-blur-md p-1.5 rounded-xl border border-[#5F9598]/30 shadow-lg">
              <button
                onClick={() => setActiveTab("overview")}
                className={`tab-btn ${activeTab === "overview" ? "tab-active" : ""}`}
              >
                <FiActivity size={18} />
                Home
              </button>
              <button
                onClick={() => setActiveTab("classes")}
                className={`tab-btn ${activeTab === "classes" ? "tab-active" : ""}`}
              >
                <FiBook size={18} />
                Classes
              </button>
              <button
                onClick={() => setActiveTab("tests")}
                className={`tab-btn ${activeTab === "tests" ? "tab-active" : ""}`}
              >
                <FiClipboard size={18} />
                Tests
              </button>
            </div>
          </div>
          */}

          {/* Overview Tab - Landing Page */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="relative min-h-[50vh] flex items-center justify-center">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1D546D]/20 via-[#5F9598]/10 to-[#1D546D]/20 animate-gradient-slow"></div>

                  <div className="floating-shape shape-1"></div>
                  <div className="floating-shape shape-2"></div>
                  <div className="floating-shape shape-3"></div>
                  <div className="floating-shape shape-4"></div>

                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5F9598" />
                        <stop offset="100%" stopColor="#1D546D" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-draw-line" />
                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-draw-line-reverse" />
                  </svg>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
                  {/* <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[#1D546D]/30 border border-[#5F9598]/30 rounded-full backdrop-blur-sm animate-float">
                    <div className="w-2 h-2 bg-[#5F9598] rounded-full animate-pulse"></div>
                    <span className="text-[#5F9598] text-sm font-semibold uppercase tracking-wider">
                      Student Portal
                    </span>
                  </div> */}

                  <h1 className="text-4xl md:text-6xl font-black text-[#F3F4F4] mb-6 leading-tight uppercase italic tracking-tighter">
                    Welcome Back,
                    <br />
                    <span className="text-gradient drop-shadow-[0_0_20px_rgba(0,194,199,0.3)]">{studentName}</span>
                  </h1>

                  <p className="text-lg md:text-xl text-[#00C2C7] mb-8 font-black uppercase tracking-[0.2em] opacity-80">
                    Operational Status: Ready for Training
                  </p>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <button
                      onClick={() => setActiveTab("classes")}
                      className="hero-action-card group"
                    >
                      <div className="hero-card-icon bg-gradient-to-br from-[#0a2533] to-[#00C2C7]">
                        <FiBook size={24} />
                      </div>
                      <h3 className="text-xl font-black text-[#F3F4F4] mb-1 group-hover:text-[#00C2C7] transition-colors uppercase italic">
                        My Classes
                      </h3>
                      <p className="text-[#00C2C7]/60 text-[10px] font-black uppercase tracking-wider mb-3">
                        Access learning matrix
                      </p>
                      <div className="hero-card-badge">
                        {classes.length} Active {classes.length === 1 ? 'Class' : 'Classes'}
                      </div>
                      <FiArrowRight className="absolute bottom-6 right-6 text-[#00C2C7] group-hover:translate-x-2 transition-transform" size={24} />
                    </button>

                    <button
                      onClick={() => setActiveTab("tests")}
                      className="hero-action-card group"
                    >
                      <div className="hero-card-icon bg-gradient-to-br from-[#00C2C7] to-[#0a2533]">
                        <FiClipboard size={24} />
                      </div>
                      <h3 className="text-xl font-black text-[#F3F4F4] mb-1 group-hover:text-[#00C2C7] transition-colors uppercase italic">
                        My Tests
                      </h3>
                      <p className="text-[#00C2C7]/60 text-[10px] font-black uppercase tracking-wider mb-3">
                        Launch assessments
                      </p>
                      <div className="hero-card-badge">
                        {completedTests} / {tests.length} Completed
                      </div>
                      <FiArrowRight className="absolute bottom-6 right-6 text-[#00C2C7] group-hover:translate-x-2 transition-transform" size={24} />
                    </button>
                  </div>

                  <div className="mt-16 flex items-center justify-center gap-8 text-sm text-[#5F9598]">
                    {/* <div className="flex items-center gap-2">
                      <FiActivity size={16} />
                      <span>Map Reading Training</span>
                    </div> */}
                    {/* <div className="w-1 h-1 bg-[#5F9598] rounded-full"></div> */}

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="animate-fade-in">
              <div className="content-card">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="p-3 hover:bg-[#5F9598]/20 rounded-xl transition-colors text-[#5F9598] hover:text-[#F3F4F4]"
                    title="Back to Home"
                  >
                    <FiArrowRight size={24} className="rotate-180" />
                  </button>
                  <h2 className="text-2xl font-bold text-[#F3F4F4] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1D546D]/30 flex items-center justify-center">
                      <FiBook className="text-[#5F9598]" size={24} />
                    </div>
                    My Classes
                  </h2>
                </div>

                {classes.length === 0 ? (
                  <div className="empty-state-new">
                    <FiAlertCircle size={48} />
                    <p>No classes assigned yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls, idx) => {
                      const progress = classesProgress.find(p => p.class_id === cls.id);
                      const progressPercent = progress?.overall_completion_percentage || 0;

                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleClassClick(cls.id)}
                          className="class-card-new group"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="class-number-new">{idx + 1}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-[#F3F4F4] mb-2 group-hover:text-[#5F9598] transition-colors">
                                {cls.class_name}
                              </h3>
                              {progress && (
                                <div className="flex items-center justify-between text-sm text-[#5F9598] mb-3">
                                  <span>{progress.completed_documents} / {progress.total_documents} items</span>
                                  <span className="font-bold">{Math.round(progressPercent)}%</span>
                                </div>
                              )}
                              <div className="progress-bar-new">
                                <div
                                  className="progress-fill-new"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="action-btn-new">
                              View Details
                              <FiArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === "tests" && (
            <div className="animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="p-3 hover:bg-[#5F9598]/20 rounded-xl transition-colors text-[#5F9598] hover:text-[#F3F4F4]"
                    title="Back to Home"
                  >
                    <FiArrowRight size={24} className="rotate-180" />
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center shadow-lg">
                    <FiClipboard className="text-[#F3F4F4]" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#F3F4F4] uppercase italic tracking-tighter">My Tests</h2>
                    <p className="text-sm text-[#00C2C7] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                      {tests.length} Assessment Units Identified
                    </p>
                  </div>
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select-new"
                >
                  <option value="all">All Tests</option>
                  <option value="completed">Completed</option>
                  <option value="unattempted">Pending</option>
                </select>
              </div>

              {tests.length === 0 ? (
                <div className="empty-state-new">
                  <FiAlertCircle size={48} />
                  <p>No tests available</p>
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
                        onClick={() => test.status !== 'completed' && handleTestClick(test.id, test.test_set_id, test.status)}
                        className={`test-card-redesign ${test.status !== 'completed' ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-start gap-6">
                          {/* Left Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-[#F3F4F4] mb-3">
                              {test.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <span className="flex items-center gap-2 text-sm text-[#5F9598]">
                                <FiFileText size={16} />
                                <span className="font-semibold text-[#F3F4F4]">{test.total_questions}</span> Questions
                              </span>
                              {test.exam_type && (
                                <span className="flex items-center gap-2 text-sm text-[#5F9598]">
                                  <FiClock size={16} />
                                  {test.exam_type}
                                </span>
                              )}
                              {test.status === "completed" && (
                                <span className="status-badge-new status-completed-new ml-auto">
                                  <FiCheckCircle size={14} />
                                  Completed
                                </span>
                              )}
                            </div>

                            {test.status === "completed" ? (
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/review/${test.test_set_id}/${studentId}`);
                                  }}
                                  className="action-btn-secondary-new"
                                >
                                  <FiEye size={16} />
                                  Review Answers
                                </button>
                                {(() => {
                                  const scorePercent = (test.score / test.total_questions) * 100;
                                  const existingRequest = retestRequests.find(r => r.test_id === test.test_id);
                                  if (scorePercent < 50) {
                                    if (existingRequest) {
                                      return (
                                        <div className="status-badge-new status-pending-new px-4 py-3">
                                          <FiRefreshCcw size={14} />
                                          {existingRequest.status}
                                        </div>
                                      );
                                    }
                                    return (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRetestRequest(test);
                                        }}
                                        className="action-btn-primary-new"
                                        disabled={requestingId === test.id}
                                      >
                                        <FiRefreshCcw size={16} />
                                        Request Retest
                                      </button>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              <button className="action-btn-primary-new">
                                {test.status === 'in-progress' ? 'Resume Test' : 'Start Test'}
                                <FiArrowRight size={16} />
                              </button>
                            )}
                          </div>

                          {/* Right - Score Circle */}
                          {test.status === 'completed' && (
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                              <div className="score-circle-container">
                                <svg className="score-circle-svg" width="100" height="100" viewBox="0 0 100 100">
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="rgba(95, 149, 152, 0.2)"
                                    strokeWidth="8"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(test.score / test.total_questions) * 283} 283`}
                                    transform="rotate(-90 50 50)"
                                  />
                                  <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#00C2C7" />
                                      <stop offset="100%" stopColor="#0a2533" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <div className="score-circle-content">
                                  <div className="text-2xl font-black text-[#F3F4F4]">{test.score}</div>
                                  <div className="text-xs text-[#5F9598] font-semibold">/ {test.total_questions}</div>
                                </div>
                              </div>
                              <div className="text-sm font-bold text-[#5F9598]">
                                {Math.round((test.score / test.total_questions) * 100)}% Score
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        /* Glass Effects */
        .glass-container {
          background: rgba(10, 37, 51, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .content-card {
          background: rgba(10, 37, 51, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 32px;
          padding: 2.5rem;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
        }

        /* Hero Action Cards */
        .hero-action-card {
          position: relative;
          padding: 2rem;
          background: rgba(10, 37, 51, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.15);
          border-radius: 28px;
          text-align: left;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          overflow: hidden;
        }

        .hero-action-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 194, 199, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .hero-action-card:hover::before {
          opacity: 1;
        }

        .hero-action-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(10, 37, 51, 0.85);
          border-color: rgba(0, 194, 199, 0.4);
          box-shadow: 0 25px 50px -12px rgba(0, 194, 199, 0.25);
        }

        .hero-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #061E29;
          margin-bottom: 1.5rem;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 20px rgba(0, 194, 199, 0.2);
        }

        .hero-action-card:hover .hero-card-icon {
          transform: scale(1.1) rotate(8deg);
        }

        .hero-card-badge {
          display: inline-block;
          padding: 0.6rem 1.2rem;
          background: rgba(0, 194, 199, 0.1);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 12px;
          color: #00C2C7;
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Text Gradient */
        .text-gradient {
          background: linear-gradient(135deg, #00C2C7, #0099a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Class Cards */
        .class-card-new {
          background: rgba(10, 37, 51, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 194, 199, 0.1);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .class-card-new:hover {
          background: rgba(10, 37, 51, 0.8);
          border-color: rgba(0, 194, 199, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .class-number-new {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0a2533, #00C2C7);
          color: #061E29;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 0 15px rgba(0, 194, 199, 0.2);
        }

        .progress-bar-new {
          width: 100%;
          height: 10px;
          background: rgba(0, 194, 199, 0.05);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(0, 194, 199, 0.1);
        }

        .progress-fill-new {
          height: 100%;
          background: linear-gradient(90deg, #00C2C7, #00e2e7);
          border-radius: 999px;
          transition: width 1s cubic-bezier(0.65, 0, 0.35, 1);
          box-shadow: 0 0 15px rgba(0, 194, 199, 0.4);
        }

        /* Redesigned Test Cards */
        .test-card-redesign {
          background: rgba(10, 37, 51, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 194, 199, 0.1);
          border-radius: 28px;
          padding: 2.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .test-card-redesign.cursor-pointer:hover {
          background: rgba(10, 37, 51, 0.8);
          border-color: rgba(0, 194, 199, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        /* Score Circle */
        .score-circle-container {
          position: relative;
          width: 110px;
          height: 110px;
        }

        .score-circle-svg {
          transform: rotate(0deg);
          filter: drop-shadow(0 0 8px rgba(0, 194, 199, 0.2));
        }

        .score-circle-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        /* Status Badges */
        .status-badge-new {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .status-completed-new {
          background: rgba(0, 194, 199, 0.1);
          color: #00C2C7;
          border: 1px solid rgba(0, 194, 199, 0.3);
          box-shadow: 0 0 15px rgba(0, 194, 199, 0.1);
        }

        .status-pending-new {
          background: rgba(243, 244, 244, 0.05);
          color: #F3F4F4;
          border: 1px solid rgba(243, 244, 244, 0.1);
        }

        /* Score Badge */
        .score-badge-new {
          padding: 1.25rem 1.75rem;
          background: rgba(10, 37, 51, 0.6);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 16px;
          text-align: center;
        }

        .score-value-new {
          font-size: 2.5rem;
          font-weight: 900;
          color: #00C2C7;
          line-height: 1;
          italic: true;
        }

        .score-total-new {
          font-size: 0.9rem;
          color: #00C2C7;
          opacity: 0.5;
          font-weight: 900;
          text-transform: uppercase;
        }

        /* Action Buttons */
        .action-btn-new {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #0a2533, #061E29);
          color: #00C2C7;
          border-radius: 14px;
          font-weight: 900;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          border: 1px solid rgba(0, 194, 199, 0.2);
          cursor: pointer;
        }

        .action-btn-new:hover {
          background: #00C2C7;
          color: #061E29;
          transform: translateX(6px);
          box-shadow: 0 0 20px rgba(0, 194, 199, 0.4);
        }

        .action-btn-primary-new {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #00C2C7, #0099a3);
          color: #061E29;
          border-radius: 14px;
          font-weight: 900;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 194, 199, 0.3);
        }

        .action-btn-primary-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 194, 199, 0.5);
          filter: brightness(1.1);
        }

        .action-btn-secondary-new {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1rem 2rem;
          background: rgba(10, 37, 51, 0.8);
          color: #00C2C7;
          border: 1px solid rgba(0, 194, 199, 0.3);
          border-radius: 14px;
          font-weight: 900;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          cursor: pointer;
        }

        .action-btn-secondary-new:hover {
          background: rgba(0, 194, 199, 0.1);
          border-color: #00C2C7;
          box-shadow: 0 0 15px rgba(0, 194, 199, 0.2);
        }

        /* Filter Select */
        .filter-select-new {
          padding: 0.875rem 1.5rem;
          background: rgba(10, 37, 51, 0.8);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 14px;
          color: #00C2C7;
          font-weight: 900;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          outline: none;
          transition: all 0.3s;
        }

        .filter-select-new:hover {
          border-color: #00C2C7;
          box-shadow: 0 0 15px rgba(0, 194, 199, 0.1);
        }

        /* Empty State */
        .empty-state-new {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          color: #00C2C7;
          gap: 1.5rem;
          opacity: 0.8;
        }

        .empty-state-new p {
          font-weight: 900;
          font-size: 1.25rem;
          color: #F3F4F4;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          italic: true;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 72px;
          height: 72px;
          border: 4px solid rgba(0, 194, 199, 0.1);
          border-top-color: #00C2C7;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(0, 194, 199, 0.2);
          animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        /* Floating Orbs */
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 194, 199, 0.15), transparent);
          filter: blur(50px);
          animation: float-orb 20s infinite ease-in-out;
          pointer-events: none;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          top: 70%;
          right: -5%;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          bottom: -5%;
          left: 40%;
          animation-delay: 14s;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
            opacity: 0.4;
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
            opacity: 0.3;
          }
        }

        @keyframes float-shape {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -30px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes gradient-slow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes draw-line {
          0% {
            stroke-dasharray: 0 1000;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 1000 0;
            opacity: 0;
          }
        }

        @keyframes draw-line-reverse {
          0% {
            stroke-dasharray: 1000 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 0 1000;
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient-slow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes draw-line {
          0% {
            stroke-dasharray: 0 1000;
          }
          100% {
            stroke-dasharray: 1000 0;
          }
        }

        @keyframes draw-line-reverse {
          0% {
            stroke-dasharray: 1000 0;
          }
          100% {
            stroke-dasharray: 0 1000;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }

        .animate-draw-line {
          animation: draw-line 8s ease-in-out infinite;
        }

        .animate-draw-line-reverse {
          animation: draw-line-reverse 8s ease-in-out infinite;
        }
      `}</style>
    </div >
  );
}