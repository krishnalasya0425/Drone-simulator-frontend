import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", regiment: "", batch_no: "", army_id: "", role: "student", password: "", status: "" });
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login"; // redirect ONLY when token missing
  }
}, []);



  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const role = activeTab === "students" ? "student" : "instructor";
      const res = await api.get(`/users/role/${role}`);
      
      // Fetch OTPs for each user
      const otpRes = await api.get(`/otp/admin-dashboard?role=${role}`);
      const usersWithOtp = res.data.map(u => {
        const otpData = otpRes.data.find(o => o.user_id === u.id);
        return { ...u, otp: otpData?.otp || null, otpValid: otpData?.valid || false };
      });

      if (role === "student") setStudents(usersWithOtp);
      else setInstructors(usersWithOtp);
    } catch (err) { console.error(err); }
  };

  const approveUser = async (id) => {
    try {
      await api.put(`/users/${id}/status`, { status: "Approved" });
      if (activeTab === "students") setStudents(prev => prev.map(u => u.id === id ? { ...u, status: "Approved" } : u));
      else setInstructors(prev => prev.map(u => u.id === id ? { ...u, status: "Approved" } : u));
    } catch { alert("Failed to approve user"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); } catch { alert("Failed to delete"); }
  };

  const startEdit = (user) => { 
    setEditingUser(user); 
    setForm({ ...user, password: "" }); 
    setShowModal(true); 
  };

  const cancelEdit = () => { 
    setEditingUser(null); 
    setForm({ name: "", regiment: "", batch_no: "", army_id: "", role: activeTab, password: "", status: "" }); 
    setShowModal(false); 
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) await api.put(`/users/${editingUser.id}`, form);
      else await api.post("/users/register", form);
      cancelEdit();
      fetchUsers();
    } catch { alert("Error"); }
  };

  const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login"; // force logout
};


const generateOtp = async (armyId) => {
  try {
    await api.post("/otp/request", { armyId });

    alert("OTP generated for user!");
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to generate OTP");
  }
};

  const renderTable = (users) => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Army ID</th>
          <th>Batch No</th>
          <th>Regiment</th>
          <th>Role</th>
          <th>Status</th>
          <th>OTP</th> {/* OTP Column */}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.army_id}</td>
            <td>{u.batch_no}</td>
            <td>{u.regiment}</td>
            <td>{u.role}</td>
            <td>{u.status || "Pending"}</td>
            <td style={{ color: u.otpValid ? "green" : "red", fontWeight: "bold" }}>
              {u.otp || "-"}
            </td>
            <td style={{display: "flex", justifyContent:"center", gap:"0.5rem"}}>
              <button onClick={() => startEdit(u)} className="btn edit">Edit</button>
              <button onClick={() => deleteUser(u.id)} className="btn delete">Delete</button>
              {u.status !== "Approved" && <button onClick={() => approveUser(u.id)} className="btn approve">Approve</button>}
              <button onClick={() => generateOtp(u.army_id)} className="btn otp">
  Generate OTP
</button>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <button className={activeTab === "students" ? "active" : ""} onClick={() => setActiveTab("students")}>Students</button>
        <button className={activeTab === "instructors" ? "active" : ""} onClick={() => setActiveTab("instructors")}>Instructors</button>
       <button className="logout-btn" onClick={logout}>Logout</button>

      </div>

      {/* Main Content */}
      <div className="admin-main">
        <h2>{activeTab === "students" ? "Students" : "Instructors"}</h2>

        <button className="btn add mb-4" onClick={() => { setShowModal(true); setEditingUser(null); }}>
          Add New User
        </button>

        <div className="admin-form-card">
          {activeTab === "students" ? renderTable(students) : renderTable(instructors)}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={submitForm}>
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
              <input name="regiment" placeholder="Regiment" value={form.regiment} onChange={handleChange} />
              <input name="batch_no" placeholder="Batch No" value={form.batch_no} onChange={handleChange} />
              <input name="army_id" placeholder="Army ID" value={form.army_id} onChange={handleChange} />
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
              <select name="status" value={form.status || ""} onChange={handleChange}>
                <option value="">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
              <div style={{display:"flex", justifyContent:"flex-end", gap:"0.5rem", marginTop:"1rem"}}>
                <button className="btn add">{editingUser ? "Update" : "Add"}</button>
                <button type="button" className="btn cancel" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}