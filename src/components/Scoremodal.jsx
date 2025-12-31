import React, { useEffect, useState } from "react";
import testAPI from "../entities/test";
import Users from "../entities/users";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowRight, FiPlus, FiFilter, FiFileText, FiCheckCircle } from "react-icons/fi";
import GenerateTest from "./GenerateTest";

const TestManagement = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  const [tests, setTests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const [newTestName, setNewTestName] = useState("");
  const [editTestId, setEditTestId] = useState(null);
  const [editTestName, setEditTestName] = useState("");
  const [open, setOpen] = useState(false);

  // Load tests on mount and when instructor filter changes
  useEffect(() => {
    loadTests();
  }, [selectedInstructorId]);

  const loadTests = async () => {
    try {
      let data;

      // ================= ADMIN =================
      if (role === "admin") {
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          setInstructors(inst);
        }

        data = selectedInstructorId
          ? await testAPI.getAllTests(selectedInstructorId)
          : await testAPI.getAllTests();
      }

      // ================= STUDENT =================
      else if (role === "Student") {
        data = await testAPI.getAllTests(userId, "Student");
      }

      // ================= INSTRUCTOR =================
      else {
        data = await testAPI.getAllTests(userId);
      }

      setTests(data);
    } catch (err) {
      console.error("Error loading tests", err);
    }
  };

  // Add test (Instructor only)
  const handleAddTest = async () => {
    if (!newTestName.trim()) return;
    await testAPI.addTest(newTestName, userId);
    setNewTestName("");
    loadTests();
  };

  // Delete test
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      await testAPI.deleteTest(id);
      loadTests();
    }
  };

  // Edit test
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FiFileText className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#074F06' }}>Test Management</h1>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage and review all tests</p>
        </div>

        {/* ================= ADMIN FILTER ================= */}
        {role === "admin" && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FiFilter style={{ color: '#074F06' }} size={16} />
              <label className="text-sm font-bold text-gray-800">Filter by Instructor</label>
            </div>
            <select
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none bg-white text-gray-700 text-sm transition-all"
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#074F06'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Instructors</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ================= INSTRUCTOR ADD TEST ================= */}
        {role === "Instructor" && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <button
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all shadow hover:shadow-lg"
              style={{ backgroundColor: '#074F06' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
            >
              <FiPlus size={20} /> Generate New Test
            </button>

            {open && <GenerateTest onClose={() => setOpen(false)} />}
          </div>
        )}

        {/* ================= TEST LIST ================= */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: '#f8faf8' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">
                {role === "Student" ? "My Tests" : "All Tests"} ({tests.length})
              </h2>
            </div>
          </div>

          {/* Test List */}
          <div className="divide-y divide-gray-100">
            {tests.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <FiFileText size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No tests available</p>
                <p className="text-sm text-gray-400 mt-1">
                  {role === "Instructor" ? "Click 'Generate New Test' to create one" : "Tests will appear here when assigned"}
                </p>
              </div>
            ) : (
              tests.map((test, idx) => (
                <div
                  key={test.id}
                  className="p-4 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Test Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-500 font-semibold text-sm w-8">{idx + 1}.</span>

                      {editTestId === test.id ? (
                        <input
                          value={editTestName}
                          onChange={(e) => setEditTestName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border-2 rounded-lg outline-none text-sm"
                          style={{ borderColor: '#074F06' }}
                          autoFocus
                        />
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{test.title}</h3>
                          {test.class_name && (
                            <p className="text-xs text-gray-500 mt-0.5">Class: {test.class_name}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* Student View */}
                      {role === "Student" && (
                        <>
                          {test.score === null ? (
                            <button
                              onClick={() => navigate(`/${test.id}/questions`)}
                              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
                              style={{ backgroundColor: '#074F06' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                            >
                              <FiArrowRight size={16} /> Start Test
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold border border-green-300">
                              <FiCheckCircle size={16} />
                              Score: {test.score} / {test.total_questions}
                            </div>
                          )}
                        </>
                      )}

                      {/* Admin/Instructor View */}
                      {role !== "Student" && (
                        <>
                          <button
                            onClick={() => navigate(`/${test.id}/review`)}
                            className="p-2 rounded-lg transition-all hover:bg-green-100"
                            style={{ color: '#074F06' }}
                            title="View Scores"
                          >
                            <FiArrowRight size={20} />
                          </button>

                          {editTestId === test.id ? (
                            <button
                              onClick={handleUpdate}
                              className="p-2 rounded-lg transition-all hover:bg-green-100"
                              style={{ color: '#074F06' }}
                              title="Save"
                            >
                              <FiCheckCircle size={20} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(test.id, test.title)}
                              className="p-2 text-blue-600 rounded-lg transition-all hover:bg-blue-50"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-2 text-red-600 rounded-lg transition-all hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;