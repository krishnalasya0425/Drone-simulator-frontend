// import { useEffect, useState } from "react";
// import api from "../../entities/axios";
// import { FiEdit, FiTrash2, FiCheckCircle, FiKey, FiLogOut, FiUsers } from "react-icons/fi";
// import React from "react"

// export default function InstructorDashboard() {
//   const [students, setStudents] = useState([]);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     regiment: "",
//     batch_no: "",
//     army_id: "",
//     role: "student",
//     status: "Pending",
//   });

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const fetchStudents = async () => {
//     try {
//       const res = await api.get("/users/role/student");
//        setStudents(res.data);
   

//     //   const otpRes = await api.get("/otp/instructor-dashboard");
//     //   const otpData = otpRes.data;

//     //   const studentsWithOtp = allStudents.map((s) => {
//     //     const otpEntry = otpData.find((o) => o.student.id === s.id);
//     //     return {
//     //       ...s,
//     //       otp: otpEntry?.otp || null,
//     //       otpValid: otpEntry?.valid || false,
//     //     };
//     //   });

//     //   setStudents(studentsWithOtp);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   console.log(students)

//   const updateStatus = async (id, status) => {
//     try {
//       await api.put(`/users/${id}/status`, { status });
//       setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)));
//     } catch (err) {
//       alert("Failed to update status");
//     }
//   };

//   const startEdit = (student) => {
//     setEditingStudent(student);
//     setForm({ ...student });
//     setShowModal(true);
//   };

//   const cancelEdit = () => {
//     setEditingStudent(null);
//     setShowModal(false);
//   };

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const submitForm = async (e) => {
//     e.preventDefault();
//     try {
//       await api.put(`/users/${editingStudent.id}`, form);
//       cancelEdit();
//       fetchStudents();
//     } catch (err) {
//       alert("Failed to update");
//     }
//   };

//   const deleteStudent = async (id) => {
//     if (!window.confirm("Delete this student?")) return;
//     await api.delete(`/users/${id}`);
//     setStudents(students.filter((s) => s.id !== id));
//   };

//   const generateOtp = async (armyId) => {
//     try {
//       await api.post("/otp/request", { armyId });
//       alert("OTP generated");
//       fetchStudents();
//     } catch {
//       alert("Failed to generate OTP");
//     }
//   };

//   return (
//     <div className="flex bg-gray-100 min-h-screen">

//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-md p-6 border-r border-gray-200">
//         <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-2">
//           <FiUsers /> Instructor
//         </h2>

//         <nav className="space-y-3">
//           <button className="w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600">
//             All Students
//           </button>

//           <button className="w-full border border-red-400 text-red-500 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 mt-20">
//             <FiLogOut /> Logout
//           </button>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8">

//         <h2 className="text-3xl font-bold text-blue-600 mb-6">
//           All Students
//         </h2>

//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <table className="w-full table-auto border-collapse">
//             <thead>
//               <tr className="bg-blue-50 text-blue-700">
//                 <th className="p-3 text-left">Name</th>
//                 <th className="p-3 text-left">Army ID</th>
//                 <th className="p-3 text-left">Batch No</th>
//                 <th className="p-3 text-left">Regiment</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-left">OTP</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {students.map((s) => (
//                 <tr key={s.id} className="border-b hover:bg-gray-50">
//                   <td className="p-3">{s.name}</td>
//                   <td className="p-3">{s.army_id}</td>
//                   <td className="p-3">{s.batch_no}</td>
//                   <td className="p-3">{s.regiment}</td>

//                   {/* Status */}
//                   <td className="p-3">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         s.status === "Approved"
//                           ? "bg-green-100 text-green-600"
//                           : s.status === "Rejected"
//                           ? "bg-red-100 text-red-600"
//                           : "bg-yellow-100 text-yellow-600"
//                       }`}
//                     >
//                       {s.status}
//                     </span>
//                   </td>

//                   {/* OTP */}
//                   <td
//                     className={`p-3 font-bold ${
//                       s.otpValid ? "text-green-600" : "text-red-500"
//                     }`}
//                   >
//                     {s.otp || "-"}
//                   </td>

//                   {/* Actions */}
//                   <td className="p-3 flex gap-3 justify-center">

//                     <button
//                       onClick={() => startEdit(s)}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <FiEdit size={20} />
//                     </button>

//                     <button
//                       onClick={() => deleteStudent(s.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <FiTrash2 size={20} />
//                     </button>

//                     {s.status !== "Approved" && (
//                       <button
//                         onClick={() => updateStatus(s.id, "Approved")}
//                         className="text-green-500 hover:text-green-700"
//                       >
//                         <FiCheckCircle size={20} />
//                       </button>
//                     )}

//                     <button
//                       onClick={() => generateOtp(s.army_id)}
//                       className="text-yellow-500 hover:text-yellow-700"
//                     >
//                       <FiKey size={20} />
//                     </button>

//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </main>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

//           <div className="bg-white p-6 rounded-lg shadow-xl w-96">
//             <h3 className="text-lg font-semibold mb-4 text-blue-600">Edit Student</h3>

//             <form onSubmit={submitForm} className="space-y-3">

//               <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleChange} />

//               <input className="input" name="regiment" placeholder="Regiment" value={form.regiment} onChange={handleChange} />

//               <input className="input" name="batch_no" placeholder="Batch No" value={form.batch_no} onChange={handleChange} />

//               <input className="input" name="army_id" placeholder="Army ID" value={form.army_id} onChange={handleChange} />

//               <select className="input" name="status" value={form.status} onChange={handleChange}>
//                 <option value="Pending">Pending</option>
//                 <option value="Approved">Approved</option>
//                 <option value="Rejected">Rejected</option>
//               </select>

//               <div className="flex justify-end gap-3 mt-4">
//                 <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
//                   Update
//                 </button>
//                 <button
//                   type="button"
//                   className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//                   onClick={cancelEdit}
//                 >
//                   Cancel
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
