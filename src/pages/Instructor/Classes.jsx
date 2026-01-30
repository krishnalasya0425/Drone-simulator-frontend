import React, { useEffect, useState } from "react";
import { classAPI } from "../../entities/class";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowRight, FiPlus, FiUsers, FiBook, FiFilter } from "react-icons/fi";
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
  const [adminInstructorId, setAdminInstructorId] = useState("");

  useEffect(() => {
    loadClasses();
  }, [selectedInstructorId]);

  const loadClasses = async () => {
    try {
      let data;

      if (role === "admin") {
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          setInstructors(inst);
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
      if (adminInstructorId) {
        formData.append("instructor_id", adminInstructorId);
      }

      await classAPI.adminAddClass(formData);

      alert("Class created successfully");

      setShowAddModal(false);
      setAdminClassName("");
      setAdminInstructorId("");

      loadClasses();
    } catch (err) {
      console.error(err);
      // Show the specific error message from backend
      alert(err.message || "Failed to create class");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#074F06' }}>
                Class Management
              </h1>
              <p className="text-gray-600">
                {role === "admin" ? "Manage all classes across instructors" :
                  role === "Instructor" ? "View your assigned classes" :
                    "View your enrolled classes"}
              </p>
            </div>

            {/* Add Class Button - Instructor and Admin */}
            {role === "admin" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
              >
                <FiPlus size={20} />
                Add New Class
              </button>
            )}
          </div>

          {/* Remove Add Class button for Instructors */}
          {/* Instructors can no longer create classes */}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                  <FiBook className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold" style={{ color: '#074F06' }}>{classes.length}</p>
                </div>
              </div>
            </div>

            {role === "admin" && (
              <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#D5F2D5' }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                    <FiUsers className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructors</p>
                    <p className="text-2xl font-bold" style={{ color: '#074F06' }}>{instructors.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Section - Admin Only */}
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
                      View classes by specific instructor
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
                    <option value="" style={{ backgroundColor: 'white', color: '#074F06' }}>
                      All Instructors ({instructors.length})
                    </option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id} style={{ backgroundColor: 'white', color: '#074F06' }}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <style>{`
                    select option:checked {
                      background-color: #074F06 !important;
                      color: white !important;
                    }
                    select:focus option:checked {
                      background-color: #074F06 !important;
                      color: white !important;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: '#D5F2D5' }}>
              <FiBook size={48} style={{ color: '#074F06' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h3>
            <p className="text-gray-500">
              {role === "Instructor" ? "No classes assigned to you yet" : "No classes available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, idx) => (
              <div
                key={cls.id}
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
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.backgroundColor = 'rgba(213, 242, 213, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(7, 79, 6, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'rgba(213, 242, 213, 0.7)';
                }}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: '#074F06' }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        {editMode && editClassId === cls.id ? (
                          <input
                            value={editClassName}
                            onChange={(e) => setEditClassName(e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded-lg outline-none"
                            style={{ borderColor: '#074F06' }}
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-opacity-90 transition-colors">
                            {cls.class_name}
                          </h3>
                        )}
                      </div>
                    </div>
                  </div>


                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2">
                    {/* View/Open Button */}
                    <button
                      onClick={() => navigate(`/${cls.id}/docs`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                      style={{ backgroundColor: '#074F06' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                    >
                      <span>Open Class</span>
                      <FiArrowRight size={18} />
                    </button>

                    {/* Edit/Update Button - Admin Only */}
                    {role === "admin" && (
                      <>
                        {editMode && editClassId === cls.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              className="p-3 rounded-lg text-white transition-all"
                              style={{ backgroundColor: '#074F06' }}
                              title="Save"
                            >
                              <FiPlus size={18} className="rotate-45" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-3 bg-gray-400 rounded-lg text-white transition-all hover:bg-gray-500"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(cls.id, cls.class_name)}
                              className="p-3 rounded-lg transition-all hover:bg-white"
                              style={{ color: '#074F06' }}
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(cls.id)}
                              className="p-3 text-red-600 rounded-lg transition-all hover:bg-white"
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
            ))}
          </div>
        )}
      </div>

      {/* Add Class Modal - Different for Admin vs Instructor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-2xl w-full max-w-md animate-fadeIn" style={{ backgroundColor: '#D5F2D5' }}>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#074F06' }}>
                {role === "admin" ? "Add New Class" : "Create New Class"}
              </h3>

              {/* Class Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Class Name
                </label>
                <input
                  type="text"
                  value={role === "admin" ? adminClassName : addClassName}
                  onChange={(e) => role === "admin" ? setAdminClassName(e.target.value) : setAddClassName(e.target.value)}
                  placeholder="Enter class name..."
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                  style={{ borderColor: '#074F06' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  autoFocus
                />
              </div>

              {/* Instructor Selection - Admin Only */}
              {role === "admin" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Assign to Instructor (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all bg-white"
                    style={{ borderColor: '#074F06', color: '#074F06' }}
                    value={adminInstructorId}
                    onChange={(e) => setAdminInstructorId(e.target.value)}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="">No Instructor (Unassigned)</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    You can assign an instructor later if needed
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddClassName("");
                    setAdminClassName("");
                    setAdminInstructorId("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={role === "admin" ? submitAddClass : handleAdd}
                  disabled={role === "admin" ? !adminClassName.trim() : !addClassName.trim()}
                  className="flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#074F06' }}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
                >
                  {role === "admin" ? "Add Class" : "Create Class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
