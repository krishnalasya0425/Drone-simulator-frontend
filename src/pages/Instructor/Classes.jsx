import React, { useEffect, useState } from "react";
import { classAPI } from "../../entities/class";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowRight, FiPlus, FiUsers, FiBook, FiFilter, FiCheck, FiX, FiLayers, FiActivity, FiTarget, FiBox } from "react-icons/fi";
import { FaRobot, FaMicrochip } from "react-icons/fa";
import Users from "../../entities/users";

const Classes = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const id = localStorage.getItem("id");

  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const [addClassName, setAddClassName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Admin-specific states for class creation
  const [adminClassName, setAdminClassName] = useState("");
  const [adminInstructorIds, setAdminInstructorIds] = useState([]);

  // State for managing instructors modal
  const [showManageInstructorsModal, setShowManageInstructorsModal] = useState(false);
  const [selectedClassForInstructors, setSelectedClassForInstructors] = useState(null);
  const [classInstructors, setClassInstructors] = useState([]);

  useEffect(() => {
    loadClasses();
  }, [selectedInstructorId]);

  const loadClasses = async () => {
    try {
      let data;

      if (role === "admin") {
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          // Filter out System Admin
          const filteredInst = inst.filter(i => i.name !== "System Admin");
          setInstructors(filteredInst);
        }

        // Admin sees all classes or filtered by instructor
        if (selectedInstructorId) {
          data = await classAPI.getAllClasses(selectedInstructorId, "admin");
        } else {
          data = await classAPI.getAllClasses(null, "admin");
        }
      } else if (role === "Student") {
        data = await classAPI.getAllClasses(id, "Student");
      } else {
        // Instructor sees only their assigned classes
        data = await classAPI.getAllClasses(id, "Instructor");
      }

      setClasses(data);
    } catch (err) {
      console.error("Error loading classes", err);
    }
  };

  const handleAdd = async () => {
    if (!addClassName.trim()) return;
    await classAPI.addClass(addClassName, id);
    setAddClassName("");
    setShowAddModal(false);
    loadClasses();
  };

  const handleDelete = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      await classAPI.deleteClass(classId);
      loadClasses();
    }
  };

  const handleEdit = (classId, name) => {
    setEditMode(true);
    setEditClassId(classId);
    setEditClassName(name);
  };

  const handleUpdate = async () => {
    await classAPI.updateClass(editClassId, editClassName);
    setEditMode(false);
    setEditClassName("");
    setEditClassId(null);
    loadClasses();
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditClassName("");
    setEditClassId(null);
  };

  // Admin: Create class with instructor assignment
  const submitAddClass = async () => {
    if (!adminClassName.trim()) {
      alert("Please enter a class name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("class_name", adminClassName);
      formData.append("created_by", id); // Admin's ID
      if (adminInstructorIds.length > 0) {
        formData.append("instructor_ids", JSON.stringify(adminInstructorIds));
      }

      await classAPI.adminAddClass(formData);

      alert("Class created successfully");

      setShowAddModal(false);
      setAdminClassName("");
      setAdminInstructorIds([]);

      loadClasses();
    } catch (err) {
      console.error(err);
      // Show the specific error message from backend
      alert(err.message || "Failed to create class");
    }
  };

  // Toggle instructor selection
  const toggleInstructorSelection = (instructorId) => {
    setAdminInstructorIds(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  // Open manage instructors modal
  const openManageInstructorsModal = async (classItem) => {
    setSelectedClassForInstructors(classItem);
    try {
      const instructors = await classAPI.getInstructorsInClass(classItem.id);
      setClassInstructors(instructors.map(i => i.id));
      setShowManageInstructorsModal(true);
    } catch (err) {
      console.error("Failed to fetch instructors:", err);
      alert("Failed to load instructors");
    }
  };

  // Toggle instructor in existing class
  const toggleClassInstructor = (instructorId) => {
    setClassInstructors(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  // Save instructors for existing class
  const saveClassInstructors = async () => {
    try {
      await classAPI.updateClassInstructors(
        selectedClassForInstructors.id,
        classInstructors,
        role
      );
      alert("Instructors updated successfully");
      setShowManageInstructorsModal(false);
      setSelectedClassForInstructors(null);
      setClassInstructors([]);
      loadClasses();
    } catch (err) {
      console.error("Failed to update instructors:", err);
      alert("Failed to update instructors");
    }
  };

  return (
    <div className="min-h-screen bg-[#061E29] p-8 font-sans text-white overflow-x-hidden relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-[#0a2533]/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-5 border border-[#00C2C7]/20 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden group">
          {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FaRobot size={80} />
          </div> */}

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#061E29] text-xl shadow-[0_0_20px_rgba(0,194,199,0.3)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30">
              <FiLayers />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Course Registry
              </h1>
              {/* <div className="flex items-center gap-2 mt-1">
                <span className="h-0.5 w-8 bg-[#00C2C7]"></span>
                <p className="text-[#00C2C7] font-black text-[10px] uppercase tracking-[0.3em]">Operational Matrix v2.0</p>
              </div> */}
            </div>
          </div>

          {role === "admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#00C2C7] text-[#061E29] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,194,199,0.3)] hover:shadow-[0_0_25px_rgba(0,194,199,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 relative z-10 group"
            >
              <FiPlus className="stroke-[3]" />
              Initialize New Course
            </button>
          )}
        </div>

        {/* HUD Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-[#00C2C7]/20 transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/30 bg-[#00C2C7]/10">
              <FiBook size={18} />
            </div>
            <div>
              <p className="text-[9px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">Total Active Courses</p>
              <h3 className="text-xl font-black text-white tracking-tighter mt-0.5">{classes.length}</h3>
            </div>
          </div>

          {role === "admin" && (
            <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-[#00C2C7]/20 transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/30 bg-[#00C2C7]/10">
                <FiUsers size={18} />
              </div>
              <div>
                <p className="text-[9px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">Operational Instructors</p>
                <h3 className="text-xl font-black text-white tracking-tighter mt-0.5">{instructors.length}</h3>
              </div>
            </div>
          )}
        </div>

        {/* Filter Section - Admin Only */}
        {role === "admin" && (
          <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00C2C7] bg-[#00C2C7]/10 border border-[#00C2C7]/20">
                  <FiFilter size={14} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Filter </h2>
                  {/* <p className="text-[9px] text-[#00C2C7] font-black uppercase tracking-widest opacity-60">Selection by operational lead</p> */}
                </div>
              </div>

              <div className="relative group">
                <select
                  className="bg-[#061E29] border-2 border-white/5 text-white/80 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none focus:border-[#00C2C7]/50 appearance-none min-w-[240px] transition-all cursor-pointer"
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                >
                  <option value="">All Personnel ({instructors.length})</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#00C2C7]/40 group-hover:text-[#00C2C7] transition-colors">
                  <FiArrowRight />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-[#00C2C7]/10 border border-[#00C2C7]/20 flex items-center justify-center text-[#00C2C7] mx-auto mb-8 shadow-[0_0_30px_rgba(0,194,199,0.1)]">
              <FiBook size={48} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Active Protocols</h3>
            <p className="text-[#00C2C7]/40 text-xs font-black uppercase tracking-[0.3em] mt-4">Registry currently awaiting course initialization</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls, idx) => (
              <div
                key={cls.id}
                className="group relative bg-[#0a2533]/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5 transition-all duration-500 hover:border-[#00C2C7]/30 hover:shadow-[0_0_30px_rgba(0,194,199,0.1)] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <FiActivity size={80} className="text-[#00C2C7]" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#061E29] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] font-black text-base shadow-[0_0_10px_rgba(0,194,199,0.2)]">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      {editMode && editClassId === cls.id ? (
                        <div className="flex gap-2">
                          <input
                            value={editClassName}
                            onChange={(e) => setEditClassName(e.target.value)}
                            className="bg-[#061E29] border-2 border-[#00C2C7] text-white px-3 py-2 rounded-xl outline-none w-full"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">
                          {cls.class_name}
                        </h3>
                      )}
                    </div>
                  </div>

                  {role === "admin" && (
                    <div className="mb-8 p-4 bg-[#061E29]/50 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[9px] text-[#00C2C7]/40 font-black uppercase tracking-widest mb-1">Operational Personnel</p>
                          <p className="text-xs font-bold text-white/80 truncate">
                            {cls.instructor_names || 'PENDING ASSIGNMENT'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openManageInstructorsModal(cls);
                          }}
                          className="w-10 h-10 rounded-xl bg-[#00C2C7]/10 flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/20 hover:bg-[#00C2C7] hover:text-[#061E29] transition-all group/btn"
                        >
                          <FiUsers />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/${cls.id}/docs`)}
                      className="flex-1 bg-[#061E29] text-[#00C2C7] px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border border-white/5 hover:border-[#00C2C7]/30 hover:bg-[#00C2C7]/5 transition-all flex items-center justify-center gap-2 group/access"
                    >
                      Initialize Content
                      <FiArrowRight className="group-hover/access:translate-x-1 transition-transform" />
                    </button>

                    {role === "admin" && (
                      <div className="flex gap-2">
                        {editMode && editClassId === cls.id ? (
                          <>
                            <button onClick={handleUpdate} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg"><FiCheck /></button>
                            <button onClick={cancelEdit} className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10"><FiX /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(cls.id, cls.class_name)} className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-[#00C2C7]/10 hover:text-[#00C2C7] transition-all"><FiEdit /></button>
                            <button onClick={() => handleDelete(cls.id)} className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"><FiTrash2 /></button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS - Styled with the same theme */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#061E29]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0a2533] rounded-2xl border border-[#00C2C7]/30 shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-7">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00C2C7] text-[#061E29]">
                  <FiPlus className="stroke-[3]" size={16} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Protocol Creation</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-[#00C2C7] uppercase tracking-[0.3em] block mb-2">Unit Designation</label>
                  <input
                    type="text"
                    value={role === "admin" ? adminClassName : addClassName}
                    onChange={(e) => role === "admin" ? setAdminClassName(e.target.value) : setAddClassName(e.target.value)}
                    placeholder="Enter unique course tag..."
                    className="w-full bg-[#061E29] border-2 border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-[#00C2C7]/50 transition-all"
                  />
                </div>

                {role === "admin" && (
                  <div>
                    <label className="text-[10px] font-black text-[#00C2C7] uppercase tracking-[0.3em] block mb-3">Assign Personnel</label>
                    <div className="bg-[#061E29] border-2 border-white/5 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                      {instructors.map((instructor) => (
                        <div
                          key={instructor.id}
                          className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer mb-2 ${adminInstructorIds.includes(instructor.id) ? 'bg-[#00C2C7]/10 border border-[#00C2C7]/20 shadow-[0_0_15px_rgba(0,194,199,0.05)]' : 'border border-transparent hover:bg-white/5'}`}
                          onClick={() => toggleInstructorSelection(instructor.id)}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${adminInstructorIds.includes(instructor.id) ? 'bg-[#00C2C7] border-[#00C2C7]' : 'border-white/10 bg-[#0a2533]'}`}>
                            {adminInstructorIds.includes(instructor.id) && <FiCheck className="text-[#061E29] stroke-[4]" size={12} />}
                          </div>
                          <span className={`text-sm font-black uppercase tracking-widest ${adminInstructorIds.includes(instructor.id) ? 'text-white' : 'text-white/40'}`}>
                            {instructor.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddClassName("");
                      setAdminClassName("");
                      setAdminInstructorIds([]);
                    }}
                    className="flex-1 bg-white/5 text-white/40 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-transparent"
                  >
                    Abort
                  </button>
                  <button
                    onClick={role === "admin" ? submitAddClass : handleAdd}
                    className="flex-[2] bg-[#00C2C7] text-[#061E29] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,194,199,0.2)] hover:shadow-[0_0_35px_rgba(0,194,199,0.4)] transition-all"
                  >
                    Deploy Protocol
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Instructors Modal */}
      {showManageInstructorsModal && selectedClassForInstructors && (
        <div className="fixed inset-0 bg-[#061E29]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0a2533] rounded-2xl border border-[#00C2C7]/30 shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00C2C7] text-[#061E29]">
                  <FiUsers className="stroke-[3]" size={16} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Personnel Assignment</h3>
                  <p className="text-[10px] text-[#00C2C7] font-black uppercase tracking-widest opacity-60 mt-1">Class: {selectedClassForInstructors.class_name}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#061E29] border-2 border-white/5 rounded-2xl p-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {instructors.map((instructor) => (
                    <div
                      key={instructor.id}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer mb-2 ${classInstructors.includes(instructor.id) ? 'bg-[#00C2C7]/10 border border-[#00C2C7]/20 shadow-[0_0_15px_rgba(0,194,199,0.05)]' : 'border border-transparent hover:bg-white/5'}`}
                      onClick={() => toggleClassInstructor(instructor.id)}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${classInstructors.includes(instructor.id) ? 'bg-[#00C2C7] border-[#00C2C7]' : 'border-white/10 bg-[#0a2533]'}`}>
                        {classInstructors.includes(instructor.id) && <FiCheck className="text-[#061E29] stroke-[4]" size={12} />}
                      </div>
                      <span className={`text-sm font-black uppercase tracking-widest ${classInstructors.includes(instructor.id) ? 'text-white' : 'text-white/40'}`}>
                        {instructor.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowManageInstructorsModal(false);
                      setSelectedClassForInstructors(null);
                      setClassInstructors([]);
                    }}
                    className="flex-1 bg-white/5 text-white/40 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Abort Changes
                  </button>
                  <button
                    onClick={saveClassInstructors}
                    className="flex-[2] bg-[#00C2C7] text-[#061E29] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,194,199,0.2)] hover:shadow-[0_0_35px_rgba(0,194,199,0.4)] transition-all"
                  >
                    Commit Personnel Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 194, 199, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 194, 199, 0.4);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default Classes;
