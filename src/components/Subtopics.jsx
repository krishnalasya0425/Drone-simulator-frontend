import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SubtopicService from "../entities/subtopic";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiList } from "react-icons/fi";
import { FaLayerGroup } from "react-icons/fa";

const Subtopics = ({ userRole }) => {
  const { classId } = useParams();

  const [subtopics, setSubtopics] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  // Fetch subtopics
  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const res = await SubtopicService.getSubtopicsByClassId(classId);
      setSubtopics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtopics();
  }, [classId]);

  // Checkbox handlers
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(subtopics.map((s) => s.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Add subtopic
  const handleAdd = async () => {
    if (!newSubtopic.trim()) return;

    await SubtopicService.createSubtopic({
      class_id: classId,
      subtopic_name: newSubtopic
    });

    setNewSubtopic("");
    fetchSubtopics();
  };

  // Update subtopic
  const handleUpdate = async () => {
    await SubtopicService.updateSubtopic(editId, {
      subtopic_name: editName
    });

    setEditId(null);
    setEditName("");
    fetchSubtopics();
  };

  // Delete selected subtopics (bulk)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} subtopic(s)?`)) {
      return;
    }

    await SubtopicService.deleteByIds({
      ids: selectedIds
    });

    setSelectedIds([]);
    fetchSubtopics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg" style={{ backgroundColor: '#074F06' }}>
                <FaLayerGroup />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Manage Subtopics
                </h1>
                <p className="text-sm text-gray-500 mt-1">Class {classId} - Organize learning modules</p>
              </div>
            </div>
            <div className="text-center px-4 py-2 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <div className="text-2xl font-bold" style={{ color: '#074F06' }}>
                {subtopics.length}
              </div>
              <p className="text-xs text-gray-600 font-semibold">Total Topics</p>
            </div>
          </div>
        </div>

        {/* Add New Subtopic */}
        {role === "Instructor" && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border-2 border-green-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiPlus size={20} style={{ color: '#074F06' }} />
              Add New Subtopic
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter subtopic name (e.g., PDF Reading Module, VR Practice Session)"
                value={newSubtopic}
                onChange={(e) => setNewSubtopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400 transition-all"
              />
              <button
                onClick={handleAdd}
                disabled={!newSubtopic.trim()}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => !newSubtopic.trim() ? null : e.target.style.backgroundColor = '#053d05'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
              >
                <FiPlus size={18} />
                Add Topic
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {role === "Instructor" && subtopics.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">
                  {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'No items selected'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm px-4 py-2 border-2 rounded-lg font-semibold transition-all hover:bg-green-50"
                  style={{ borderColor: '#074F06', color: '#074F06' }}
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  disabled={selectedIds.length === 0}
                  className="text-sm px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg font-semibold transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiTrash2 size={14} />
                  Delete ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subtopics List */}
        <div className="bg-white rounded-xl shadow-md border-2 border-green-100 overflow-hidden">
          <div className="p-5 border-b border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiList size={20} style={{ color: '#074F06' }} />
              Subtopics List
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subtopics.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaLayerGroup size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-semibold">No subtopics found</p>
              <p className="text-sm mt-1">Add your first subtopic to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subtopics.map((subtopic, index) => (
                <div
                  key={subtopic.id}
                  className={`p-4 transition-all ${selectedIds.includes(subtopic.id) ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {role === "Instructor" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(subtopic.id)}
                          onChange={() => toggleSelect(subtopic.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-400 cursor-pointer"
                        />
                      )}

                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: '#074F06' }}>
                        {index + 1}
                      </div>

                      {editId === subtopic.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                          className="flex-1 border-2 border-green-400 rounded-lg px-3 py-2 font-semibold text-gray-800 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-gray-800 flex-1">
                          {subtopic.subtopic_name}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {role === "Instructor" && (
                      <div className="flex gap-2">
                        {editId === subtopic.id ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              className="px-4 py-2 rounded-lg font-semibold text-white transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                              style={{ backgroundColor: '#074F06' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                            >
                              <FiCheck size={16} />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditId(null);
                                setEditName("");
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all hover:bg-gray-300 flex items-center gap-2"
                            >
                              <FiX size={16} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditId(subtopic.id);
                              setEditName(subtopic.subtopic_name);
                            }}
                            className="px-4 py-2 border-2 rounded-lg font-semibold transition-all hover:bg-green-50 flex items-center gap-2"
                            style={{ borderColor: '#074F06', color: '#074F06' }}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subtopics;
