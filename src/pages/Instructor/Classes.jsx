import React, { useEffect, useState } from "react";
import { classAPI } from "../../entities/class";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowRight, FiPlus } from "react-icons/fi";
import Users from "../../entities/users";

const Classes = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const id = localStorage.getItem("id"); // current user id (Instructor or Student)

  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const [addClassName, setAddClassName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState("");

  // Load classes on mount AND when instructor filter changes
  useEffect(() => {
    loadClasses();
  }, [selectedInstructorId]);

  const loadClasses = async () => {
    try {
      let data;

      // ---------------------------------------
      // ADMIN → Fetch all OR filtered by instructor
      // ---------------------------------------
      if (role === "admin") {
        // Load instructor list once
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          setInstructors(inst);
        }

        if (selectedInstructorId) {
          data = await classAPI.getAllClasses(selectedInstructorId);
        } else {
          data = await classAPI.getAllClasses();
        }
      }

      // ---------------------------------------
      // STUDENT → Fetch assigned classes
      // ---------------------------------------
      else if (role === "Student") {
        data = await classAPI.getAllClasses(id, "Student");
      }

      // ---------------------------------------
      // INSTRUCTOR → Fetch own created classes
      // ---------------------------------------
      else {
        data = await classAPI.getAllClasses(id);
      }

      setClasses(data);
    } catch (err) {
      console.error("Error loading classes", err);
    }
  };

  const handleAdd = async () => {
    await classAPI.addClass(addClassName, id);
    setAddClassName("");
    loadClasses();
  };

  const handleDelete = async (id) => {
    await classAPI.deleteClass(id);
    loadClasses();
  };

    const handleEdit = (id, name) => {
    setEditMode(true);
    setEditClassId(id);
    setEditClassName(name);
  };

  const handleUpdate = async () => {
    await classAPI.updateClass(editClassId, editClassName);
    setEditMode(false);
    setEditClassName("");
    setEditClassId(null);
    loadClasses();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <h2 className="text-3xl font-bold mb-4">Class Management</h2>

      {/* ================================
         ADMIN → FILTER BY INSTRUCTOR
      ================================= */}
      {role === "admin" && (
        <div className="mb-5">
          <label className="block mb-2 font-semibold">Filter by Instructor</label>

          <select
            className="border px-3 py-2 rounded w-full text-black"
            value={selectedInstructorId}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
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

      {/* ================================
         INSTRUCTOR → ADD CLASS
      ================================= */}
      {role === "Instructor" && (
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={addClassName}
            onChange={(e) => setAddClassName(e.target.value)}
            placeholder="Enter class name"
            className="border px-3 py-2 w-full rounded"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiPlus /> Add
          </button>
        </div>
      )}

      {/* ================================
         CLASS LIST
      ================================= */}
      <div className="space-y-3">
        {classes.map((cls, idx) => (
          <div
            key={cls.id}
            className="p-4 shadow bg-white rounded flex justify-between items-center"
          >
            <h1>{idx + 1}.</h1>

            {/* CLASS NAME */}
            {editMode && editClassId === cls.id ? (
              <input
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span className="text-lg font-medium">{cls.class_name}</span>
            )}

            <div className="flex gap-4">
              {/* OPEN SYLLABUS */}
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => navigate(`/${cls.id}/docs`)}
              >
                <FiArrowRight size={20} />
              </button>

              {/* Instructor/Admin → Edit/Delete */}
              {role !== "Student" && (
                <>
                  <button
                    onClick={() =>
                      editMode
                        ? handleUpdate()
                        : handleEdit(cls.id, cls.class_name)
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;
