import { useEffect, useState } from "react";
import api from "../../entities/axios";
import { classAPI } from "../../entities/class";
import retestAPI from "../../entities/retest";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaKey,
  FaSearch,
  FaSync,
  FaFileSignature
} from "react-icons/fa";
import { FiX, FiActivity, FiUsers, FiClipboard, FiTarget, FiArrowRight } from "react-icons/fi";

const RANK_OPTIONS = [
  "Sepoy (Sep)",
  "Rifleman (RFN)",
  "Lance Naik (L/Nk)",
  "Naik (Nk)",
  "Havildar (Hav)",
  "Naib Subedar (Nb Sub)",
  "Subedar (Sub)",
  "Subedar Major (Sub Maj)",
  "Lieutenant (Lt)",
  "Captain (Capt)",
  "Major (Maj)",
  "Lieutenant Colonel (Lt Col)",
  "Colonel (Col)",
  "Others"
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("student");
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    rank: "",
    unit: "",
    course_no: "",
    army_no: "",
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
  const [retestRequests, setRetestRequests] = useState([]);
  const [loadingRetests, setLoadingRetests] = useState(false);
  const [retestHistory, setRetestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const instructorId = localStorage.getItem("id");
  const userName = localStorage.getItem("name");

  useEffect(() => {
    if (!localStorage.getItem("token")) window.location.href = "/login";
    setTimeout(() => setLoading(false), 800);
  }, []);

  useEffect(() => {
    if (filter === "retest") {
      fetchRetestRequests();
    } else if (filter === "history") {
      fetchRetestHistory();
    } else {
      fetchUsers();
    }
  }, [filter]);

  useEffect(() => {
    if (role === "Instructor" && instructorId) {
      fetchInstructorClasses();
    }
  }, [role, instructorId]);

  const fetchUsers = async () => {
    try {
      const userRole = filter;
      let queryParams = `role=${userRole}`;
      if (role === 'Instructor' && userRole === 'student') {
        queryParams += `&instructorId=${instructorId}`;
      }
      const otpRes = await api.get(`/otp/admin-dashboard?${queryParams}`);
      userRole === "student" ? setStudents(otpRes.data) : setInstructors(otpRes.data);
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

  const fetchRetestRequests = async () => {
    try {
      setLoadingRetests(true);
      const res = await retestAPI.getInstructorRequests(instructorId);
      setRetestRequests(res.data);
    } catch (err) {
      console.error("Error fetching retest requests:", err);
    } finally {
      setLoadingRetests(false);
    }
  };

  const fetchRetestHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await retestAPI.getRetestHistory();
      setRetestHistory(res.data);
    } catch (err) {
      console.error("Error fetching retest history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRetestStatus = async (requestId, status) => {
    try {
      await retestAPI.updateStatus(requestId, status);
      fetchRetestRequests();
      alert(`Retest request ${status}`);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const generateOtp = async (armyNo) => {
    try {
      await api.post("/otp/request", { armyNo });
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
      rank: "",
      unit: "",
      course_no: "",
      army_no: "",
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

  const users = filter === "student" ? students : instructors;
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.army_no?.toLowerCase().includes(query) ||
      user.course_no?.toLowerCase().includes(query) ||
      user.unit?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#061E29]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D546D]/20 via-transparent to-[#5F9598]/20" />
        <div className="relative z-10 glass-container p-12 text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <p className="text-[#F3F4F4] text-xl font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const backgroundImage = role === "Instructor"
    ? 'url(https://i.pinimg.com/1200x/74/12/24/74122495fce0ecc59121da5641d16280.jpg)'
    : 'url(https://i.pinimg.com/1200x/39/a3/35/39a3359710ee24c66c8ef1a82c47ae46.jpg)';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#061E29]">
      {/* Live Animated Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage,
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D546D]/10 via-transparent to-[#5F9598]/10 animate-gradient-slow" />
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tab Navigation (Commented Out) */}
          {/* Overview Tab - Hero Landing */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="relative min-h-[60vh] flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00C2C7]/10 via-transparent to-[#0099a3]/10 animate-gradient-slow"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight uppercase italic tracking-tight">
                      <span className="text-[#00C2C7]">Welcome Back,</span>
                      <br />
                      <span className="text-[#F3F4F4]">{userName}</span>
                    </h1>
                    <p className="text-sm text-[#00C2C7]/60 font-black uppercase tracking-[0.2em]">
                      {role === "Instructor" ? "Instructor Command Center" : "Admin Control Panel"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={() => { setActiveTab("manage"); setFilter("student"); }}
                      className="flex items-center gap-4 px-6 py-4 bg-[#0a2533]/60 backdrop-blur-xl border border-[#00C2C7]/20 rounded-2xl hover:border-[#00C2C7]/50 hover:bg-[#00C2C7]/10 transition-all group min-w-[260px]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#00C2C7]/10 border border-[#00C2C7]/30 flex items-center justify-center text-[#00C2C7] flex-shrink-0">
                        <FaUserGraduate size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-black text-[#F3F4F4] group-hover:text-[#00C2C7] uppercase italic">Manage Students</h3>
                        <p className="text-[10px] text-[#00C2C7]/50 uppercase tracking-wider">View & edit accounts</p>
                      </div>
                      <FiArrowRight className="ml-auto text-[#00C2C7]/50 group-hover:translate-x-1 transition-transform" size={18} />
                    </button>

                    {role === "admin" && (
                      <button
                        onClick={() => { setActiveTab("manage"); setFilter("instructor"); }}
                        className="flex items-center gap-4 px-6 py-4 bg-[#0a2533]/60 backdrop-blur-xl border border-[#00C2C7]/20 rounded-2xl hover:border-[#00C2C7]/50 hover:bg-[#00C2C7]/10 transition-all group min-w-[260px]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#00C2C7]/10 border border-[#00C2C7]/30 flex items-center justify-center text-[#00C2C7] flex-shrink-0">
                          <FaChalkboardTeacher size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-black text-[#F3F4F4] group-hover:text-[#00C2C7] uppercase italic">Manage Instructors</h3>
                          <p className="text-[10px] text-[#00C2C7]/50 uppercase tracking-wider">Oversee instructor accounts</p>
                        </div>
                        <FiArrowRight className="ml-auto text-[#00C2C7]/50 group-hover:translate-x-1 transition-transform" size={18} />
                      </button>
                    )}

                    {role === "Instructor" && (
                      <button
                        onClick={() => { setActiveTab("retests"); setFilter("retest"); }}
                        className="flex items-center gap-4 px-6 py-4 bg-[#0a2533]/60 backdrop-blur-xl border border-[#00C2C7]/20 rounded-2xl hover:border-[#00C2C7]/50 hover:bg-[#00C2C7]/10 transition-all group min-w-[260px]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#00C2C7]/10 border border-[#00C2C7]/30 flex items-center justify-center text-[#00C2C7] flex-shrink-0">
                          <FaSync size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-black text-[#F3F4F4] group-hover:text-[#00C2C7] uppercase italic">Retest Requests</h3>
                          <p className="text-[10px] text-[#00C2C7]/50 uppercase tracking-wider">Review and approve retests</p>
                        </div>
                        {retestRequests.filter(r => r.status === 'Pending').length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {retestRequests.filter(r => r.status === 'Pending').length}
                          </span>
                        )}
                        <FiArrowRight className="ml-2 text-[#00C2C7]/50 group-hover:translate-x-1 transition-transform" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manage Users Tab */}
          {activeTab === "manage" && (
            <div className="animate-fade-in">
              <div className="bg-[#0a2533]/60 backdrop-blur-xl border border-[#00C2C7]/20 rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="p-2 hover:bg-[#00C2C7]/10 rounded-lg transition-colors text-[#00C2C7]/60 hover:text-[#00C2C7]"
                      title="Back to Home"
                    >
                      <FiArrowRight size={18} className="rotate-180" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C2C7] to-[#0099a3] flex items-center justify-center shadow-lg">
                      <FiUsers className="text-[#061E29]" size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#F3F4F4] uppercase italic tracking-tight">User Management</h2>
                      <p className="text-[9px] text-[#00C2C7]/60 font-black uppercase tracking-wider">
                        {filteredUsers.length} {filter === "student" ? "students" : "instructors"} found
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-sm w-full ml-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-[#00C2C7]/40" size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder={`Search ${filter === "student" ? "students" : "instructors"}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#061E29] border border-[#00C2C7]/20 rounded-lg text-sm text-[#F3F4F4] placeholder:text-[#00C2C7]/30 focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                {role === "admin" && (
                  <div className="flex gap-2 mb-5">
                    <button
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all uppercase tracking-wider ${filter === "student"
                        ? "bg-[#00C2C7] text-[#061E29] shadow-lg"
                        : "bg-[#00C2C7]/10 text-[#00C2C7]/60 hover:bg-[#00C2C7]/20 border border-[#00C2C7]/20"
                        }`}
                      onClick={() => { setFilter("student"); setSearchQuery(""); }}
                    >
                      <FaUserGraduate size={12} />
                      Students
                    </button>

                    <button
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all uppercase tracking-wider ${filter === "instructor"
                        ? "bg-[#00C2C7] text-[#061E29] shadow-lg"
                        : "bg-[#00C2C7]/10 text-[#00C2C7]/60 hover:bg-[#00C2C7]/20 border border-[#00C2C7]/20"
                        }`}
                      onClick={() => { setFilter("instructor"); setSearchQuery(""); }}
                    >
                      <FaChalkboardTeacher size={12} />
                      Instructors
                    </button>

                    <button
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all uppercase tracking-wider ${filter === "history"
                        ? "bg-[#00C2C7] text-[#061E29] shadow-lg"
                        : "bg-[#00C2C7]/10 text-[#00C2C7]/60 hover:bg-[#00C2C7]/20 border border-[#00C2C7]/20"
                        }`}
                      onClick={() => { setFilter("history"); setSearchQuery(""); }}
                    >
                      <FaFileSignature size={12} />
                      Retest History
                    </button>
                  </div>
                )}



                {/* Table */}
                {filter === "history" ? (
                  <div className="overflow-x-auto rounded-xl border border-[#00C2C7]/10">
                    <table className="w-full">
                      <thead className="bg-[#00C2C7]/10 border-b border-[#00C2C7]/20">
                        <tr>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Student</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Class</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Original Test</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Original Score</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Retest</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Retest Score</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retestHistory.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-10 text-center text-[#5F9598] bg-[#1D546D]/10">
                              {loadingHistory ? "Loading..." : "No retest history found."}
                            </td>
                          </tr>
                        ) : (
                          retestHistory.map((record) => (
                            <tr key={record.id} className="border-b border-[#00C2C7]/5 hover:bg-[#00C2C7]/5 transition-colors">
                              <td className="p-4 text-[#F3F4F4] font-bold">{record.student_name}</td>
                              <td className="p-4 text-[#00C2C7]/60">{record.class_name}</td>
                              <td className="p-4 text-[#00C2C7]/60">{record.original_test_title}</td>
                              <td className="p-4 text-red-400 font-bold">
                                {record.score} / {record.total_questions} ({Math.round((record.score / record.total_questions) * 100)}%)
                              </td>
                              <td className="p-4 text-[#00C2C7]/60">{record.retest_title || 'Not taken yet'}</td>
                              <td className="p-4">
                                {record.retest_score !== null && record.retest_score !== undefined ? (
                                  <span className={`font-bold ${record.retest_score >= record.score ? 'text-green-400' : 'text-orange-400'}`}>
                                    {record.retest_score} / {record.total_questions} ({Math.round((record.retest_score / record.total_questions) * 100)}%)
                                  </span>
                                ) : (
                                  <span className="text-[#5F9598]/50 italic">Not submitted</span>
                                )}
                              </td>
                              <td className="p-4 text-[#00C2C7]/60 text-sm">
                                {record.retest_submitted_at ? new Date(record.retest_submitted_at).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#00C2C7]/10">
                    <table className="w-full">
                      <thead className="bg-[#00C2C7]/10 border-b border-[#00C2C7]/20">
                        <tr>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Name</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Rank</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Army No</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Course No</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Unit</th>
                          <th className="p-4 text-left text-[#F3F4F4] font-bold">Status</th>
                          <th className="p-4 text-center text-[#F3F4F4] font-bold">OTP</th>
                          <th className="p-4 text-center text-[#F3F4F4] font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.filter(u => u.id !== 0).map((u) => (
                          <tr key={u.id} className="border-b border-[#00C2C7]/5 hover:bg-[#00C2C7]/5 transition-colors">
                            <td className="p-4">
                              {u.role === "student" || filter === "student" ? (
                                <button
                                  onClick={() => navigate(`/student/${u.id}`)}
                                  className="hover:underline font-bold text-[#F3F4F4] hover:text-[#00C2C7] transition-colors"
                                >
                                  {u.name}
                                </button>
                              ) : (
                                <span className="text-[#F3F4F4] font-bold">{u.name}</span>
                              )}
                            </td>
                            <td className="p-4 text-[#00C2C7]/60">{u.rank || "-"}</td>
                            <td className="p-4 text-[#00C2C7]/60">{u.army_no}</td>
                            <td className="p-4 text-[#00C2C7]/60">{u.course_no}</td>
                            <td className="p-4 text-[#00C2C7]/60">{u.unit}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === "Approved" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                {u.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-4 text-center font-semibold">
                              {(() => {
                                if (!u.otp) return <span className="text-[#00C2C7]/30">-</span>;
                                const timestamp = u.otp_at || u.otp_generated_at || u.updated_at || u.createdAt;
                                if (timestamp) {
                                  const generatedAt = new Date(timestamp).getTime();
                                  const now = new Date().getTime();
                                  const diffHrs = (now - generatedAt) / (1000 * 60 * 60);
                                  if (diffHrs > 24) return <span className="text-[#00C2C7]/30">-</span>;
                                }
                                if (!timestamp && u.otpValid === false) return <span className="text-[#00C2C7]/30">-</span>;
                                return (
                                  <span className={u.otpValid ? "text-green-400" : "text-red-400"}>
                                    {u.otp}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => startEdit(u)}
                                  className="p-2 hover:bg-[#00C2C7]/10 rounded-lg transition-colors text-[#00C2C7]/60 hover:text-[#00C2C7]"
                                  title="Edit"
                                >
                                  <FaEdit size={18} />
                                </button>
                                <button
                                  onClick={() => generateOtp(u.army_no)}
                                  className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors text-yellow-400"
                                  title="Generate OTP"
                                >
                                  <FaKey size={18} />
                                </button>
                                {u.status !== "Approved" && (
                                  <button
                                    onClick={async () => {
                                      if (role === "Instructor") {
                                        await fetchInstructorClasses();
                                        setApprovingStudent(u);
                                        setSelectedClassId("");
                                      } else {
                                        api.put(`/users/${u.id}/status`, { status: "Approved" }).then(fetchUsers);
                                      }
                                    }}
                                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400"
                                    title="Approve"
                                  >
                                    <FaCheck size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Delete ${u.name}?`)) {
                                      try {
                                        await api.delete(`/users/${u.id}`);
                                        alert('User deleted successfully');
                                        fetchUsers();
                                      } catch (error) {
                                        if (error.response?.data?.hasClasses) {
                                          alert(`Cannot delete instructor!\n\n${error.response.data.message}\n\nPlease delete or reassign their classes first.`);
                                        } else {
                                          alert(`Error: ${error.response?.data?.message || 'Failed to delete user'}`);
                                        }
                                      }
                                    }
                                  }}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                  title="Delete"
                                >
                                  <FaTrash size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Retests Tab */}
          {activeTab === "retests" && role === "Instructor" && (
            <div className="animate-fade-in">
              <div className="bg-[#0a2533]/60 backdrop-blur-xl border border-[#00C2C7]/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="p-2 hover:bg-[#00C2C7]/10 rounded-lg transition-colors text-[#00C2C7]/60 hover:text-[#00C2C7]"
                      title="Back to Home"
                    >
                      <FiArrowRight size={18} className="rotate-180" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C2C7] to-[#0099a3] flex items-center justify-center shadow-lg">
                      <FaSync className="text-[#061E29]" size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#F3F4F4] uppercase italic tracking-tight">Retest Requests</h2>
                      <p className="text-[9px] text-[#00C2C7]/60 font-black uppercase tracking-wider">
                        {retestRequests.length} total requests
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#00C2C7]/10">
                  <table className="w-full">
                    <thead className="bg-[#00C2C7]/10 border-b border-[#00C2C7]/20">
                      <tr>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Student</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Class</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Original Test</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Previous Score</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Retest Score</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Requested</th>
                        <th className="p-4 text-left text-[#F3F4F4] font-bold">Status</th>
                        <th className="p-4 text-center text-[#F3F4F4] font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retestRequests.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-10 text-center text-[#5F9598] bg-[#1D546D]/10">
                            No retest requests found.
                          </td>
                        </tr>
                      ) : (
                        retestRequests.map((req) => (
                          <tr key={req.id} className="border-b border-[#00C2C7]/5 hover:bg-[#00C2C7]/5 transition-colors">
                            <td className="p-4 text-[#F3F4F4] font-bold">{req.student_name}</td>
                            <td className="p-4 text-[#00C2C7]/60">{req.class_name}</td>
                            <td className="p-4 text-[#00C2C7]/60">{req.test_title}</td>
                            <td className="p-4 text-red-400 font-bold">
                              {req.score} / {req.total_questions} ({Math.round((req.score / req.total_questions) * 100)}%)
                            </td>
                            <td className="p-4">
                              {req.retest_score !== null && req.retest_score !== undefined ? (
                                <span className={`font-bold ${req.retest_score >= req.score ? 'text-green-400' : 'text-orange-400'}`}>
                                  {req.retest_score} / {req.total_questions} ({Math.round((req.retest_score / req.total_questions) * 100)}%)
                                </span>
                              ) : (
                                <span className="text-[#5F9598]/50 italic">Not taken yet</span>
                              )}
                            </td>
                            <td className="p-4 text-[#00C2C7]/60 text-sm">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.retest_score !== null && req.retest_score !== undefined ? 'bg-purple-500/20 text-purple-400' :
                                req.status === 'Pending' ? 'bg-blue-500/20 text-blue-400' :
                                  req.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                    req.status === 'Denied' ? 'bg-red-500/20 text-red-400' :
                                      'bg-gray-500/20 text-gray-400'
                                }`}>
                                {req.retest_score !== null && req.retest_score !== undefined ? 'COMPLETED' : req.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {req.status === 'Pending' && (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleRetestStatus(req.id, 'Approved')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                                  >
                                    <FaCheck size={12} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleRetestStatus(req.id, 'Denied')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                                  >
                                    <FiX size={12} /> Deny
                                  </button>
                                </div>
                              )}
                              {req.status === 'Approved' && (
                                <button
                                  onClick={() => navigate(`/${req.class_id}/generatetest?studentId=${req.student_id}&requestId=${req.id}`)}
                                  className="w-full bg-gradient-to-r from-[#00C2C7] to-[#0099a3] hover:shadow-lg text-[#061E29] px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-xs font-bold"
                                >
                                  <FaPlus size={12} /> Create Test
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-[#061E29] border border-[#00C2C7]/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-[#00C2C7]/20 to-[#0099a3]/10 border-b border-[#00C2C7]/20 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-[#F3F4F4] uppercase italic tracking-tight">
                  {editingUser ? "Edit User" : "Add User"}
                </h3>
                <p className="text-[9px] text-[#00C2C7]/60 uppercase tracking-widest">System Administration</p>
              </div>
              <button
                onClick={cancelEdit}
                className="p-1.5 hover:bg-[#00C2C7]/10 rounded-lg transition-colors text-[#00C2C7]/60 hover:text-[#00C2C7]"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={submitForm} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="name"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Rank</label>
                  <select
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="rank"
                    value={form.rank}
                    onChange={handleChange}
                  >
                    <option value="">Select Rank</option>
                    {RANK_OPTIONS.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5F9598] uppercase tracking-wider block mb-2">Army No</label>
                <input
                  className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                  name="army_no"
                  placeholder="Army No"
                  value={form.army_no}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Unit</label>
                  <input
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="unit"
                    placeholder="Unit"
                    value={form.unit}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Course No</label>
                  <input
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="course_no"
                    placeholder="Course No"
                    value={form.course_no}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {(filter === "student" || form.role === "student") && allClasses.length > 0 && (
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Assign Class</label>
                  <select
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="class_id"
                    value={form.class_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Class</option>
                    {allClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7]/70 uppercase tracking-wider block mb-1.5">Password</label>
                  <input
                    type="password"
                    className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#00C2C7] to-[#0099a3] text-[#061E29] py-2.5 rounded-lg font-black text-sm hover:shadow-lg transition-all"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-[#00C2C7]/10 text-[#00C2C7]/70 py-2.5 rounded-lg font-black text-sm hover:bg-[#00C2C7]/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Selection Modal for Instructor Approval */}
      {approvingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-[#061E29] border border-[#00C2C7]/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#00C2C7]/20 to-[#0099a3]/10 border-b border-[#00C2C7]/20 p-4">
              <h3 className="text-base font-black text-[#F3F4F4] uppercase italic">Assign to Class</h3>
              <p className="text-[9px] text-[#00C2C7]/60 uppercase tracking-widest mt-0.5">Select a class for {approvingStudent.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-lg px-3 py-2.5 text-sm text-[#F3F4F4] focus:outline-none focus:border-[#00C2C7]/50 transition-all"
              >
                <option value="">Select a class</option>
                {instructorClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!selectedClassId) {
                      alert("Please select a class");
                      return;
                    }
                    try {
                      await api.put(`/users/${approvingStudent.id}/status`, {
                        status: "Approved",
                        class_id: selectedClassId
                      });
                      setApprovingStudent(null);
                      setSelectedClassId("");
                      fetchUsers();
                    } catch (err) {
                      alert("Failed to approve student");
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-[#00C2C7] to-[#0099a3] text-[#061E29] py-2.5 rounded-lg font-black text-sm hover:shadow-lg transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setApprovingStudent(null);
                    setSelectedClassId("");
                  }}
                  className="flex-1 bg-[#00C2C7]/10 text-[#00C2C7]/70 py-2.5 rounded-lg font-black text-sm hover:bg-[#00C2C7]/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .glass-container {
          background: rgba(10, 37, 51, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .text-gradient {
          background: linear-gradient(135deg, #00C2C7, #0099a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(95, 149, 152, 0.3), transparent);
          filter: blur(60px);
          animation: float-orb 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          bottom: -250px;
          right: -250px;
          animation-delay: -10s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          animation-delay: -5s;
        }

        .floating-shape {
          position: absolute;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          background: linear-gradient(135deg, rgba(95, 149, 152, 0.1), rgba(29, 84, 109, 0.1));
          animation: float-orb 15s infinite ease-in-out;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 10%;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation-delay: -5s;
        }

        .shape-3 {
          width: 180px;
          height: 180px;
          bottom: 20%;
          left: 20%;
          animation-delay: -10s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          top: 30%;
          right: 30%;
          animation-delay: -7s;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(95, 149, 152, 0.2);
          border-top-color: #5F9598;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes gradient-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .animate-gradient-slow {
          animation: gradient-slow 10s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes zoom-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }

        .animate-in {
          animation: fadeIn 0.3s ease-out, zoom-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}