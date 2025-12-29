
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
} from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("student");
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    regiment: "",
    batch_no: "",
    army_id: "",
    role: "student",
    password: "",
    status: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);
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

  const startEdit = (u) => {
    setEditingUser(u);
    setForm({ ...u, password: "" });
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
    });
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
        <thead className="bg-blue-600 text-white">
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
            <tr key={u.id} className="border-b hover:bg-blue-50">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.army_id}</td>
              <td className="p-3">{u.batch_no}</td>
              <td className="p-3">{u.regiment}</td>
              <td className="p-3 font-semibold">
                {u.status || "Pending"}
              </td>

              <td
                className="p-3 font-semibold"
                style={{
                  color: u.otpValid ? "green" : "red",
                }}
              >
                {u.otp}
              </td>

              <td className="p-3 flex gap-2 justify-center">
                <button
                  onClick={() => startEdit(u)}
                  className="text-blue-600 hover:text-blue-800"
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


  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          {role === "Instructor" ? "Instructor Dashboard" : "Admin Dashboard"}
        </h1>

      
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg shadow flex items-center gap-2 ${
            filter === "student"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setFilter("student")}
        >
          <FaUserGraduate />
          Students
        </button>

      {role === "admin" && <>
       <button
          className={`px-5 py-2 rounded-lg shadow flex items-center gap-2 ${
            filter === "instructor"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setFilter("instructor")}
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

      {/* TABLE */}
      {renderTable(users)}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Add User"}
            </h3>

            <form onSubmit={submitForm} className="space-y-3">
              <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleChange} />

              <input className="input" name="regiment" placeholder="Regiment" value={form.regiment} onChange={handleChange} />

              <input className="input" name="batch_no" placeholder="Batch No" value={form.batch_no} onChange={handleChange} />

              <input className="input" name="army_id" placeholder="Army ID" value={form.army_id} onChange={handleChange} />

              <select className="input" name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>

              <select className="input" name="status" value={form.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                 <option value="Denied">Denied</option>
              </select>


              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={cancelEdit}>Cancel</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingUser ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE STUDENT WITH CLASS SELECTION MODAL (For Instructors) */}
      {approvingStudent && role === "Instructor" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
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
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
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
