import React, { useEffect, useState } from "react";
import { classAPI } from "../../entities/class";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowRight, FiPlus } from "react-icons/fi";

const Classes = () => {
  const navigate = useNavigate();

  const createdBy = 1; // Instructor id
  const [classes, setClasses] = useState([]);

  const [addClassName, setAddClassName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState("");

  const role = "adm"
  const id ='1'

  // Load classes
  useEffect(() => {
    loadClasses();
  }, []);

const loadClasses = async () => {
  try {
    let data;

    if (role === "admin") {
      // Admin → fetch ALL classes
      data = await classAPI.getAllClasses();
    } else {
      data = await classAPI.getAllClasses(id);
    }
    setClasses(data);
  } catch (err) {
    console.error("Error loading classes", err);
  }
};


  const handleAdd = async () => {
    await classAPI.addClass(addClassName, createdBy);
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

      {/* ADD CLASS */}
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

      {/* LIST */}
      <div className="space-y-3">
        {classes.map((cls,idx) => (
          <div
            key={cls.id}
            className="p-4 shadow bg-white rounded flex justify-between items-center"
          >
            <h1>{idx+1}.</h1>
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

              {/* ROUTE TO SYLLABUS */}
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => navigate(`/${cls.id}/docs`)}
              >
                <FiArrowRight size={20} />
              </button>

              {/* EDIT */}
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

              {/* DELETE */}
              <button
                onClick={() => handleDelete(cls.id)}
                className="text-red-600 hover:text-red-800"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;
