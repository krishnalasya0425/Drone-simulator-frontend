
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
import { FaClipboardList } from "react-icons/fa";
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#074F06' }}>
                Test Management
              </h1>
              <p className="text-gray-600">
                {role === "admin" ? "Manage all tests across instructors" :
                  role === "Instructor" ? "Create and manage your tests" :
                    "View and take your assigned tests"}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                  <FiFileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold" style={{ color: '#074F06' }}>{tests.length}</p>
                </div>
              </div>
            </div>

            {role === "admin" && (
              <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#D5F2D5' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                    <FaClipboardList className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructors</p>
                    <p className="text-2xl font-bold" style={{ color: '#074F06' }}>{instructors.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Filter */}
          {role === "admin" && (
            <div
              className="p-6 rounded-xl shadow-lg border"
              style={{
                backgroundColor: 'rgba(213, 242, 213, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderColor: 'rgba(7, 79, 6, 0.2)',
                boxShadow: '0 8px 24px rgba(7, 79, 6, 0.15)'
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                    <FiFilter className="text-white" size={18} />
                  </div>
                  <div>
                    <label className="font-bold text-base" style={{ color: '#074F06' }}>
                      Filter by Instructor
                    </label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      View tests by specific instructor
                    </p>
                  </div>
                </div>

                <div className="flex-1 md:max-w-sm">
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all bg-white font-medium shadow-sm"
                    style={{
                      borderColor: '#074F06',
                      color: '#074F06'
                    }}
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)';
                      e.target.style.borderColor = '#053d05';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#074F06';
                    }}
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
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: '#D5F2D5' }}>
              <FiFileText size={48} style={{ color: '#074F06' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tests Found</h3>
            <p className="text-gray-500">
              {role === "Instructor" ? "Create your first test to get started" : "No tests available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, idx) => (
              <div
                key={test.id}
                className="group rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border"
                style={{
                  backgroundColor: 'rgba(213, 242, 213, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderColor: 'rgba(7, 79, 6, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(7, 79, 6, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#074F06';
                  e.currentTarget.style.backgroundColor = 'rgba(213, 242, 213, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(7, 79, 6, 0.2)';
                  e.currentTarget.style.backgroundColor = 'rgba(213, 242, 213, 0.7)';
                }}
              >
                <div className="p-6">
                  {/* Test Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: '#074F06' }}>
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        {editTestId === test.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editTestName}
                              onChange={(e) => setEditTestName(e.target.value)}
                              className="flex-1 px-3 py-2 border-2 rounded-lg outline-none"
                              style={{ borderColor: '#074F06' }}
                              autoFocus
                            />
                            <button
                              onClick={handleUpdate}
                              className="p-2 rounded-lg text-white transition-all"
                              style={{ backgroundColor: '#074F06' }}
                              title="Save"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-gray-400 rounded-lg text-white transition-all hover:bg-gray-500"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {test.title || `${test.test_title} — ${test.set_name}`}
                            </h3>

                            {/* Class Name Badge */}
                            {test.class_name && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ backgroundColor: '#074F06', color: 'white' }}>
                                <FiUsers size={12} />
                                {test.class_name}
                              </div>
                            )}

                            {/* Student Test Info */}
                            {role === "Student" && test.exam_type && (
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
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
                              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                              style={{ backgroundColor: '#074F06' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                            >
                              <FiArrowRight size={18} />
                              <span>Start Exam</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}>
                                Score: {test.score} / {test.total_questions}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/download/${test.test_set_id}/${userId}`, "_blank")}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all bg-white hover:shadow-md"
                                  style={{ color: '#074F06', border: '1px solid #074F06' }}
                                  title="Download Result PDF"
                                >
                                  <FiDownload size={16} />
                                  <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/review/${test.test_set_id}/${userId}`)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-white"
                                  style={{ color: '#074F06' }}
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
                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                                style={{ backgroundColor: '#074F06' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                                title="View Test"
                              >
                                <FiArrowRight size={18} />
                                <span>Open</span>
                              </button>

                              <button
                                onClick={() => handleEdit(test.id, test.title)}
                                className="p-2 rounded-lg transition-all hover:bg-white"
                                style={{ color: '#074F06' }}
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>

                              <button
                                onClick={() => handleDelete(test.id)}
                                className="p-2 text-red-600 rounded-lg transition-all hover:bg-white"
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