
import React, { useEffect, useState } from "react";
import testAPI from "../entities/test";
import Users from "../entities/users";
import { useNavigate } from "react-router-dom";
import {
  FiEdit,
  FiTrash2,
  FiArrowRight,
  FiPlus,
  FiFilter,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiUsers,
  FiDownload
} from "react-icons/fi";
import { FaClipboardList, FaRobot, FaMicrochip } from "react-icons/fa";
import GenerateTest from "./GenerateTest";

const TestManagement = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  const [tests, setTests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [editTestId, setEditTestId] = useState(null);
  const [editTestName, setEditTestName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadTests();
  }, [selectedInstructorId]);

  const loadTests = async () => {
    try {
      let data;

      if (role === "admin") {
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          // Filter out System Admin
          const filteredInst = inst.filter(i => i.name !== "System Admin");
          setInstructors(filteredInst);
        }
        data = selectedInstructorId
          ? await testAPI.getAllTests(selectedInstructorId)
          : await testAPI.getAllTests();
      } else if (role === "Student") {
        data = await testAPI.getAllTests(userId, "Student");
      } else {
        data = await testAPI.getAllTests(userId);
      }

      setTests(data);
    } catch (err) {
      console.error("Error loading tests", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      await testAPI.deleteTest(id);
      loadTests();
    }
  };

  const handleEdit = (id, name) => {
    setEditTestId(id);
    setEditTestName(name);
  };

  const handleUpdate = async () => {
    await testAPI.updateTest(editTestId, editTestName);
    setEditTestId(null);
    setEditTestName("");
    loadTests();
  };

  const cancelEdit = () => {
    setEditTestId(null);
    setEditTestName("");
  };



  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#061E29' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                  <FaClipboardList className="text-white" size={32} />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
                  Test Management
                </h1>
                <p className="text-cyan-100/70">
                  {role === "admin" ? "Manage all tests across instructors" :
                    role === "Instructor" ? "Create and manage your tests" :
                      "View and take your assigned tests"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative rounded-xl p-4 border border-cyan-500/30 overflow-hidden"
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                  <FiFileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-cyan-100/60">Total Tests</p>
                  <p className="text-2xl font-bold text-cyan-300">{tests.length}</p>
                </div>
              </div>
            </div>

            {role === "admin" && (
              <div className="relative rounded-xl p-4 border border-cyan-500/30 overflow-hidden"
                style={{
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                    <FaRobot className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-cyan-100/60">Instructors</p>
                    <p className="text-2xl font-bold text-cyan-300">{instructors.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Filter */}
          {role === "admin" && (
            <div
              className="relative rounded-xl p-6 border border-cyan-500/30 overflow-hidden"
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.15)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                    <FiFilter className="text-white" size={18} />
                  </div>
                  <div>
                    <label className="font-bold text-base text-cyan-300">
                      Filter by Instructor
                    </label>
                    <p className="text-xs text-cyan-100/60 mt-0.5">
                      View tests by specific instructor
                    </p>
                  </div>
                </div>

                <div className="flex-1 md:max-w-sm">
                  <select
                    className="w-full px-4 py-3 border border-cyan-500/30 rounded-lg outline-none transition-all bg-cyan-900/20 text-cyan-100 font-medium shadow-sm focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                  >
                    <option value="">All Instructors ({instructors.length})</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <FiFileText size={48} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">No Tests Found</h3>
            <p className="text-cyan-100/60">
              {role === "Instructor" ? "Create your first test to get started" : "No tests available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, idx) => (
              <div
                key={test.id}
                className="group relative rounded-xl overflow-hidden border border-cyan-500/30 transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
                style={{
                  backgroundColor: 'rgba(6, 30, 41, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 p-6">
                  {/* Test Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        {editTestId === test.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editTestName}
                              onChange={(e) => setEditTestName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-cyan-500/30 rounded-lg outline-none bg-cyan-900/20 text-cyan-100 focus:border-cyan-400"
                              autoFocus
                            />
                            <button
                              onClick={handleUpdate}
                              className="p-2 rounded-lg text-white transition-all bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50"
                              title="Save"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-cyan-100 transition-all hover:bg-cyan-900/50"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-cyan-100 mb-1">
                              {test.title || `${test.test_title} — ${test.set_name}`}
                            </h3>

                            {/* Class Name Badge */}
                            {test.class_name && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider mb-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                <FiUsers size={12} />
                                {test.class_name}
                              </div>
                            )}

                            {/* Student Test Info */}
                            {role === "Student" && test.exam_type && (
                              <div className="flex flex-wrap items-center gap-4 text-sm text-cyan-100/60 mt-2">
                                <div className="flex items-center gap-1">
                                  <FiFileText size={14} />
                                  <span>{test.total_questions} Questions</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiClock size={14} />
                                  <span>{test.exam_type}</span>
                                </div>
                                {test.exam_type === "TIMED" && (
                                  <div className="flex items-center gap-1">
                                    <FiClock size={14} />
                                    <span>{test.duration_minutes} mins</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <FiAward size={14} />
                                  <span>Pass: {test.pass_threshold} Score</span>
                                </div>
                              </div>
                            )}


                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Student Actions */}
                      {role === "Student" && (
                        <>
                          {test.score === null ? (
                            <button
                              onClick={() => navigate(`/${test.test_set_id}/questions`)}
                              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-all transform hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50"
                            >
                              <FiArrowRight size={18} />
                              <span>Start Exam</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300">
                                Score: {test.score} / {test.total_questions}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/download/${test.test_set_id}/${userId}`, "_blank")}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:shadow-lg hover:shadow-cyan-500/20"
                                  title="Download Result PDF"
                                >
                                  <FiDownload size={16} />
                                  <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/review/${test.test_set_id}/${userId}`)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                                  title="View Questions"
                                >
                                  <FiArrowRight size={18} />
                                  <span>Review</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Instructor/Admin Actions */}
                      {role !== "Student" && (
                        <>
                          {editTestId !== test.id && (
                            <>
                              <button
                                onClick={() => navigate(`/${test.id}/review`)}
                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-all transform hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50"
                                title="View Test"
                              >
                                <FiArrowRight size={18} />
                                <span>Open</span>
                              </button>

                              <button
                                onClick={() => handleEdit(test.id, test.title)}
                                className="p-2 rounded-lg transition-all text-cyan-300 hover:bg-cyan-900/30 border border-transparent hover:border-cyan-500/30"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>

                              <button
                                onClick={() => handleDelete(test.id)}
                                className="p-2 text-red-400 rounded-lg transition-all hover:bg-red-900/20 border border-transparent hover:border-red-500/30"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Test Modal */}
        {open && <GenerateTest onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
};

export default TestManagement;