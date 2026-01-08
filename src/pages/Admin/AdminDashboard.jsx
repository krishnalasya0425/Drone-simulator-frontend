
import { useEffect, useState } from "react";
import api from "../../entities/axios";
import { classAPI } from "../../entities/class";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaPlus,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaCheck,
  FaKey,
  FaSearch,
} from "react-icons/fa";

const DASHBOARD_STYLES = `
  .professional-modal-overlay {
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
  }
  .professional-modal-content {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid #f3f4f6;
    max-width: 320px;
    width: 100%;
    overflow: hidden;
  }
  .modal-header {
    background: #f9fafb;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  .modal-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .modal-input-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #4b5563;
    letter-spacing: 0.05em;
  }
  .modal-input-field {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    transition: all 0.2s ease;
    width: 100%;
  }
  .modal-input-field:focus {
    border-color: #074F06;
    box-shadow: 0 0 0 3px rgba(7, 79, 6, 0.08);
    outline: none;
  }
  .assignment-badge {
    background: #ecfdf5;
    color: #065f46;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    border: 1px solid #d1fae5;
  }
  .btn-primary-modal {
    background: #074F06;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .btn-primary-modal:hover {
    background: #053d05;
    transform: translateY(-1px);
  }
  .btn-secondary-modal {
    background: #f3f4f6;
    color: #374151;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
  }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("student");
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    regiment: "",
    batch_no: "",
    army_id: "",
    role: "student",
    password: "",
    status: "",
    class_id: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [approvingStudent, setApprovingStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");

  const role = localStorage.getItem("role");
  const instructorId = localStorage.getItem("id");

  useEffect(() => {
    if (!localStorage.getItem("token")) window.location.href = "/login";
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  // Fetch instructor's classes when role is Instructor
  useEffect(() => {
    if (role === "Instructor" && instructorId) {
      fetchInstructorClasses();
    }
  }, [role, instructorId]);

  const fetchUsers = async () => {
    try {
      const role = filter;
      const otpRes = await api.get(`/otp/admin-dashboard?role=${role}`);
      role === "student"
        ? setStudents(otpRes.data)
        : setInstructors(otpRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstructorClasses = async () => {
    try {
      const classes = await classAPI.getAllClasses(instructorId);
      setInstructorClasses(classes);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };



  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const generateOtp = async (armyId) => {
    try {
      await api.post("/otp/request", { armyId });
      alert("OTP generated!");
      fetchUsers();
    } catch (err) {
      alert("Failed to generate OTP");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = async (u) => {
    setEditingUser(u);
    setForm({ ...u, class_id: u.class_id || "" });

    // Fetch all classes if editing a student
    if (u.role === "student" || filter === "student") {
      try {
        const classes = role === "Instructor"
          ? await classAPI.getAllClasses(instructorId)
          : await classAPI.getAllClasses();
        setAllClasses(classes);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    }

    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm({
      name: "",
      regiment: "",
      batch_no: "",
      army_id: "",
      role: filter,
      status: "",
      class_id: "",
    });
    setAllClasses([]);
    setShowModal(false);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      editingUser
        ? await api.put(`/users/${editingUser.id}`, form)
        : await api.post("/users/register", form);

      cancelEdit();
      fetchUsers();
    } catch {
      alert("Error");
    }
  };

  const renderTable = (users) => (
    <div className="overflow-x-auto mt-4 shadow-md rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="text-white" style={{ backgroundColor: '#074F06' }}>
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Army ID</th>
            <th className="p-3">Batch</th>
            <th className="p-3">Regiment</th>
            <th className="p-3">Status</th>
            <th className="p-3">OTP</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b" style={{ backgroundColor: '#D5F2D5' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C0E8C0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D5F2D5'}>
              <td className="p-3">
                {u.role === "student" || filter === "student" ? (
                  <button
                    onClick={() => navigate(`/student/${u.id}`)}
                    className="hover:underline font-bold text-left hover:text-[#074F06] transition-colors"
                  >
                    {u.name}
                  </button>
                ) : (
                  u.name
                )}
              </td>
              <td className="p-3">{u.army_id}</td>
              <td className="p-3">{u.batch_no}</td>
              <td className="p-3">{u.regiment}</td>
              <td className="p-3 font-semibold">
                {u.status || "Pending"}
              </td>

              <td className="p-3 font-semibold text-center">
                {(() => {
                  if (!u.otp) return "-";

                  // Check if OTP is older than 24 hours
                  const timestamp = u.otp_at || u.otp_generated_at || u.updated_at || u.createdAt;
                  if (timestamp) {
                    const generatedAt = new Date(timestamp).getTime();
                    const now = new Date().getTime();
                    const diffHrs = (now - generatedAt) / (1000 * 60 * 60);

                    // If more than 24 hours have passed, it must disappear
                    if (diffHrs > 24) return "-";
                  }

                  // If we don't have a timestamp but it's marked as invalid, 
                  // we hide it to be safe, assuming it's expired.
                  if (!timestamp && u.otpValid === false) return "-";

                  return (
                    <span style={{ color: u.otpValid ? "green" : "red" }}>
                      {u.otp}
                    </span>
                  );
                })()}
              </td>

              <td className="p-3 flex gap-2 justify-center">
                <button
                  onClick={() => startEdit(u)}
                  className="hover:text-green-800"
                  style={{ color: '#074F06' }}
                >
                  <FaEdit size={18} />
                </button>

                <button
                  onClick={() => generateOtp(u.army_id)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <FaKey size={18} />
                </button>

                {u.status !== "Approved" && (
                  <button
                    onClick={async () => {
                      // If instructor, show class selection modal
                      if (role === "Instructor") {
                        // Refresh classes list before showing modal
                        await fetchInstructorClasses();
                        setApprovingStudent(u);
                        setSelectedClassId("");
                      } else {
                        // Admin can approve without class assignment
                        api
                          .put(`/users/${u.id}/status`, { status: "Approved" })
                          .then(fetchUsers);
                      }
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaCheck size={18} />
                  </button>
                )}

                <button
                  onClick={() => api.delete(`/users/${u.id}`).then(fetchUsers)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const users = filter === "student" ? students : instructors;

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.army_id?.toLowerCase().includes(query) ||
      user.batch_no?.toLowerCase().includes(query) ||
      user.regiment?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      <style>{DASHBOARD_STYLES}</style> {/* Inject styles */}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#074F06' }}>
          {role === "Instructor" ? "Instructor Dashboard" : "Admin Dashboard"}
        </h1>


      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg shadow flex items-center gap-2 ${filter === "student"
            ? "text-white"
            : "bg-gray-200 text-gray-700"
            }`}
          style={filter === "student" ? { backgroundColor: '#074F06' } : {}}
          onClick={() => {
            setFilter("student");
            setSearchQuery(""); // Clear search when switching tabs
          }}
        >
          <FaUserGraduate />
          Students
        </button>

        {role === "admin" && <>
          <button
            className={`px-5 py-2 rounded-lg shadow flex items-center gap-2 ${filter === "instructor"
              ? "text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            style={filter === "instructor" ? { backgroundColor: '#074F06' } : {}}
            onClick={() => {
              setFilter("instructor");
              setSearchQuery(""); // Clear search when switching tabs
            }}
          >
            <FaChalkboardTeacher />
            Instructors
          </button>

        </>}
        {/* <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
        >
          <FaPlus />
          Add User
        </button> */}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder={`Search ${filter === "student" ? "students" : "instructors"} by name, Army ID, batch, or regiment...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition-all duration-200 bg-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs text-gray-600">
            Found <span className="font-semibold" style={{ color: '#074F06' }}>{filteredUsers.length}</span> {filter === "student" ? "student" : "instructor"}{filteredUsers.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* TABLE */}
      {renderTable(filteredUsers)}

      {/* PROFESSIONALLY REDESIGNED MODAL */}
      {showModal && (
        <div className="fixed inset-0 professional-modal-overlay flex justify-center items-center z-[100] p-4">
          <div className="professional-modal-content animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="modal-header flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">
                  {editingUser ? "Edit User Account" : "Add New User"}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">
                  System Administration
                </p>
              </div>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitForm} className="p-3 space-y-2.5">
              {/* Credentials Section */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="modal-form-group">
                  <label className="modal-input-label">Full Name</label>
                  <input
                    className="modal-input-field"
                    name="name"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-input-label">Army ID</label>
                  <input
                    className="modal-input-field"
                    name="army_id"
                    placeholder="ID Number"
                    value={form.army_id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Units Section */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="modal-form-group">
                  <label className="modal-input-label">Regiment</label>
                  <input
                    className="modal-input-field"
                    name="regiment"
                    placeholder="Assigned unit"
                    value={form.regiment}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-input-label">Batch Number</label>
                  <input
                    className="modal-input-field"
                    name="batch_no"
                    placeholder="Batch"
                    value={form.batch_no}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Roles Section */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="modal-form-group">
                  <label className="modal-input-label">System Role</label>
                  <select className="modal-input-field" name="role" value={form.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-input-label">Account Status</label>
                  <select className="modal-input-field" name="status" value={form.status} onChange={handleChange}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
              </div>

              {/* Assignments - Enhanced Display */}
              {editingUser && (form.role === "student" || filter === "student") && (
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                  <div className="modal-form-group">
                    <label className="modal-input-label">Current Enrolled Classes</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {editingUser?.class_names ? (
                        editingUser.class_names.split(', ').map((cls, idx) => (
                          <span key={idx} className="assignment-badge">
                            {cls}
                          </span>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-400 italic">No active class assignments</p>
                      )}
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-input-label font-bold text-[#074F06]">Add New Assignment</label>
                    <select
                      className="modal-input-field bg-[#fdfdfd]"
                      name="class_id"
                      value={form.class_id || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Class --</option>
                      {allClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  className="btn-secondary-modal hover:bg-gray-200 transition-colors"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button className="btn-primary-modal shadow-lg shadow-green-900/10">
                  {editingUser ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE STUDENT WITH CLASS SELECTION MODAL (For Instructors) */}
      {approvingStudent && role === "Instructor" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="p-6 rounded-lg shadow-lg w-[400px]" style={{ backgroundColor: '#D5F2D5' }}>
            <h3 className="text-xl font-bold mb-4">Approve Student & Assign to Class</h3>
            <p className="mb-4 text-gray-600">
              Student: <strong>{approvingStudent.name}</strong> ({approvingStudent.army_id})
            </p>

            {instructorClasses.length === 0 ? (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800 mb-2">No classes available. Please create a class first.</p>
                <button
                  onClick={() => {
                    setApprovingStudent(null);
                    setSelectedClassId("");
                    navigate("/classes");
                  }}
                  className="hover:text-green-800 underline font-semibold"
                  style={{ color: '#074F06' }}
                >
                  Go to Classes Page →
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Select Class:</label>
                <select
                  className="w-full border px-3 py-2 rounded text-black"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">-- Select a class --</option>
                  {instructorClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setApprovingStudent(null);
                  setSelectedClassId("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedClassId || instructorClasses.length === 0}
                onClick={async () => {
                  try {
                    await api.put(`/users/${approvingStudent.id}/status`, {
                      status: "Approved",
                      classId: selectedClassId,
                    });
                    alert("Student approved and assigned to class successfully!");
                    setApprovingStudent(null);
                    setSelectedClassId("");
                    fetchUsers();
                  } catch (err) {
                    console.error(err);
                    alert("Error approving student");
                  }
                }}
              >
                Approve & Assign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}