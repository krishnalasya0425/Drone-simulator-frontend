import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classAPI from "../../entities/class";
import api from "../../entities/axios";
import Modal from "../../components/FileModal";
import UploadDocs from "../../components/UploadDocs";
import {
  FaFilePdf,
  FaFileImage,
  FaFile,
  FaUpload,
  FaClipboardList,
  FaMagic,
  FaFolderOpen,
  FaDownload,
  FaEye,
  FaTrash,
  FaUserPlus,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import { FiGrid, FiList, FiX } from "react-icons/fi";

const Docs = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [classData, setClassData] = useState({});
  const [docType, setDocType] = useState(null);
  const [uploadDoc, setUploadDoc] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Student management states
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [studentsToDelete, setStudentsToDelete] = useState([]);

  const role = localStorage.getItem("role");

  const loadDocs = async () => {
    try {
      const classInfo = await classAPI.getClassInfo(classId);
      setClassData(classInfo);

      const res = await classAPI.getDocs(classId);
      setDocs(res.docs);
    } catch (err) {
      console.error("Failed to load docs", err.message);
    }
  };

  useEffect(() => {
    loadDocs();
    if (role !== "Student") {
      loadClassStudents();
    }
  }, [classId, uploadDoc]);

  const loadClassStudents = async () => {
    try {
      const response = await api.get(`/classes/${classId}/students`);
      setClassStudents(response.data || []);
    } catch (err) {
      console.error("Failed to load class students", err);
      setClassStudents([]);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get(`/users?role=student&status=Approved`);
      // Filter out students already in this class
      const available = response.data.filter(
        student => !classStudents.some(cs => cs.id === student.id)
      );
      setAvailableStudents(available);
    } catch (err) {
      console.error("Failed to load students", err);
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudentsClick = async () => {
    setShowAddStudentsModal(true);
    await loadAvailableStudents();
  };

  const handleViewStudentsClick = () => {
    setShowViewStudentsModal(true);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddSelectedStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    try {
      await api.post(`/classes/${classId}/students`, {
        studentIds: selectedStudents
      });
      alert(`Successfully added ${selectedStudents.length} student(s) to the class!`);
      setSelectedStudents([]);
      setShowAddStudentsModal(false);
      await loadClassStudents();
    } catch (err) {
      console.error("Failed to add students", err);
      alert("Failed to add students. Please try again.");
    }
  };

  const getFileIcon = (mime) => {
    if (!mime) return <FaFile size={40} className="text-gray-500" />;
    if (mime.includes("pdf")) return <FaFilePdf size={40} className="text-red-500" />;
    if (mime.startsWith("image")) return <FaFileImage size={40} className="text-blue-500" />;
    return <FaFile size={40} className="text-gray-500" />;
  };

  const getFileTypeLabel = (mime) => {
    if (!mime) return "Unknown";
    if (mime.includes("pdf")) return "PDF Document";
    if (mime.startsWith("image")) return "Image";
    return "File";
  };

  const handleDeleteDoc = async (docId, docTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${docTitle}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await classAPI.deleteDoc(classId, docId);
      // Refresh the documents list
      loadDocs();
      alert("Document deleted successfully!");
    } catch (err) {
      console.error("Failed to delete document", err.message);
      alert("Failed to delete document. Please try again.");
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setStudentsToDelete([]);
  };

  const toggleStudentForDeletion = (studentId) => {
    setStudentsToDelete(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleRemoveSelectedStudents = async () => {
    if (studentsToDelete.length === 0) {
      alert("Please select at least one student to remove");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${studentsToDelete.length} student(s) from this class?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/classes/${classId}/students`, {
        data: { studentIds: studentsToDelete }
      });
      alert(`Successfully removed ${studentsToDelete.length} student(s) from the class!`);
      setStudentsToDelete([]);
      setDeleteMode(false);
      await loadClassStudents();
    } catch (err) {
      console.error("Failed to remove students", err);
      alert("Failed to remove students. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                  <FaFolderOpen className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold" style={{ color: '#074F06' }}>
                    {classData.class_name || 'Class Documents'}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-gray-600">
                      {docs.length} {docs.length === 1 ? 'document' : 'documents'} available
                    </p>
                    {role !== "Student" && (
                      <p className="text-gray-600 flex items-center gap-1">
                        <FaUsers size={14} style={{ color: '#074F06' }} />
                        <span className="font-semibold" style={{ color: '#074F06' }}>
                          {classStudents.length}
                        </span>
                        {classStudents.length === 1 ? ' student' : ' students'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {role !== "Student" && (
                <>
                  <button
                    className="flex items-center gap-2 px-5 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#8B5CF6' }}
                    onClick={() => navigate(`/${classId}/generatetest`)}
                  >
                    <FaMagic size={18} />
                    <span className="hidden sm:inline">Generate Test</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-5 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#074F06' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                    onClick={() => setUploadDoc(true)}
                  >
                    <FaUpload size={18} />
                    <span className="hidden sm:inline">Upload</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-5 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#074F06' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                    onClick={handleAddStudentsClick}
                  >
                    <FaUserPlus size={18} />
                    <span className="hidden sm:inline">Add Students</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#D5F2D5', color: '#074F06' }}
                    onClick={handleViewStudentsClick}
                  >
                    <FaUsers size={18} />
                    <span className="hidden sm:inline">View Students</span>
                  </button>
                </>
              )}

              <button
                className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-lg transition-all"
                style={{ backgroundColor: '#9FCF9F', color: '#074F06' }}
              >
                <FaClipboardList size={18} />
                <span className="hidden sm:inline">Practice</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle and Stats */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(159, 207, 159, 0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'white' }}>
                <FaFilePdf className="text-red-500" size={20} />
                <span className="font-semibold" style={{ color: '#074F06' }}>
                  {docs.filter(d => d.file_type?.includes('pdf')).length} PDFs
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'white' }}>
                <FaFileImage className="text-blue-500" size={20} />
                <span className="font-semibold" style={{ color: '#074F06' }}>
                  {docs.filter(d => d.file_type?.startsWith('image')).length} Images
                </span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-lg" style={{ backgroundColor: 'white' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'text-white' : 'text-gray-600'}`}
                style={viewMode === 'grid' ? { backgroundColor: '#074F06' } : {}}
                title="Grid View"
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'text-white' : 'text-gray-600'}`}
                style={viewMode === 'list' ? { backgroundColor: '#074F06' } : {}}
                title="List View"
              >
                <FiList size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(159, 207, 159, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
              <FaFolderOpen size={64} style={{ color: '#074F06' }} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Documents Yet</h3>
            <p className="text-gray-500 mb-6">
              {role !== "Student"
                ? "Upload your first document to get started"
                : "No documents have been uploaded for this class yet"}
            </p>
            {role !== "Student" && (
              <button
                onClick={() => setUploadDoc(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
              >
                <FaUpload size={18} />
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border relative"
                    style={{
                      backgroundColor: 'rgba(159, 207, 159, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderColor: 'rgba(7, 79, 6, 0.2)',
                      boxShadow: '0 8px 32px 0 rgba(7, 79, 6, 0.1)'
                    }}
                    onClick={() => {
                      if (doc.file_type.includes("pdf") || doc.file_type.startsWith("image")) {
                        setPreviewId(doc.id);
                        setDocType(doc.file_type);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#074F06';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.backgroundColor = 'rgba(159, 207, 159, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(7, 79, 6, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = 'rgba(159, 207, 159, 0.7)';
                    }}
                  >
                    {/* Delete Button - Only for non-students */}
                    {role !== "Student" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteDoc(doc.id, doc.doc_title);
                        }}
                        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white hover:bg-red-50 shadow-md transition-all opacity-0 group-hover:opacity-100"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#fee2e2';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Delete document"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}

                    {/* Icon/Preview */}
                    <div className="flex items-center justify-center p-8 bg-white bg-opacity-50">
                      {getFileIcon(doc.file_type)}
                    </div>

                    {/* Document Info */}
                    <div className="p-4 bg-white bg-opacity-80">
                      <h3 className="font-semibold text-gray-800 mb-2 truncate" title={doc.doc_title}>
                        {doc.doc_title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{getFileTypeLabel(doc.file_type)}</span>
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-green-600 transition-colors">
                          <FaEye size={16} />
                          <span>View</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group cursor-pointer rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border"
                    style={{
                      backgroundColor: 'rgba(159, 207, 159, 0.7)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderColor: 'rgba(7, 79, 6, 0.2)'
                    }}
                    onClick={() => {
                      if (doc.file_type.includes("pdf") || doc.file_type.startsWith("image")) {
                        setPreviewId(doc.id);
                        setDocType(doc.file_type);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#074F06';
                      e.currentTarget.style.backgroundColor = 'rgba(159, 207, 159, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(7, 79, 6, 0.2)';
                      e.currentTarget.style.backgroundColor = 'rgba(159, 207, 159, 0.7)';
                    }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{doc.doc_title}</h3>
                        <p className="text-sm text-gray-600">{getFileTypeLabel(doc.file_type)}</p>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 group-hover:text-green-600 transition-colors">
                        <FaEye size={20} />
                        <span className="font-medium">View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        {previewId && (
          <Modal fileId={previewId} docType={docType} onClose={() => setPreviewId(null)} />
        )}

        {/* Upload Modal */}
        {uploadDoc && (
          <UploadDocs
            classId={classId}
            uploadDocs={classAPI.uploadDocs}
            onClose={() => setUploadDoc(false)}
          />
        )}

        {/* Add Students Modal */}
        {showAddStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#D5F2D5' }}>
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                  <FaUserPlus size={24} />
                  Add Students to Class
                </h2>
                <button
                  onClick={() => {
                    setShowAddStudentsModal(false);
                    setSelectedStudents([]);
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <FiX size={24} style={{ color: '#074F06' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                {loadingStudents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#074F06' }}></div>
                    <p className="text-gray-600">Loading students...</p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Available Students
                    </h3>
                    <p className="text-gray-600">
                      All approved students are already in this class.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
                      <p className="text-sm font-semibold" style={{ color: '#074F06' }}>
                        Select students to add to this class ({selectedStudents.length} selected)
                      </p>
                    </div>
                    <div className="space-y-2">
                      {availableStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                          style={{
                            borderColor: selectedStudents.includes(student.id) ? '#074F06' : '#e5e7eb',
                            backgroundColor: selectedStudents.includes(student.id) ? '#D5F2D5' : 'white'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-5 h-5 rounded cursor-pointer"
                            style={{ accentColor: '#074F06' }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">{student.name}</h4>
                              {selectedStudents.includes(student.id) && (
                                <FaCheckCircle size={16} style={{ color: '#074F06' }} />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>Army ID: {student.army_id}</span>
                              <span>Batch: {student.batch_no}</span>
                              <span>Regiment: {student.regiment}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3" style={{ backgroundColor: '#f9fafb' }}>
                <button
                  onClick={() => {
                    setShowAddStudentsModal(false);
                    setSelectedStudents([]);
                  }}
                  className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedStudents}
                  disabled={selectedStudents.length === 0}
                  className="px-5 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#074F06' }}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
                >
                  Add {selectedStudents.length > 0 && `(${selectedStudents.length})`} Student{selectedStudents.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Students Modal */}
        {showViewStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#D5F2D5' }}>
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                  <FaUsers size={24} />
                  Students in {classData.class_name}
                </h2>
                <button
                  onClick={() => {
                    setShowViewStudentsModal(false);
                    setDeleteMode(false);
                    setStudentsToDelete([]);
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <FiX size={24} style={{ color: '#074F06' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                {classStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Students Enrolled
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This class doesn't have any students yet.
                    </p>
                    <button
                      onClick={() => {
                        setShowViewStudentsModal(false);
                        handleAddStudentsClick();
                      }}
                      className="px-5 py-2 rounded-lg font-semibold text-white transition-all"
                      style={{ backgroundColor: '#074F06' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                    >
                      Add Students
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#D5F2D5' }}>
                      <p className="text-sm font-semibold" style={{ color: '#074F06' }}>
                        {deleteMode
                          ? `${studentsToDelete.length} student${studentsToDelete.length !== 1 ? 's' : ''} selected for removal`
                          : `Total: ${classStudents.length} student${classStudents.length !== 1 ? 's' : ''}`
                        }
                      </p>
                      {!deleteMode && (
                        <button
                          onClick={toggleDeleteMode}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-md"
                          style={{ backgroundColor: '#dc2626' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                        >
                          <FaTrash size={14} />
                          Remove Students
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-white" style={{ backgroundColor: '#074F06' }}>
                          <tr>
                            {deleteMode && (
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={studentsToDelete.length === classStudents.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setStudentsToDelete(classStudents.map(s => s.id));
                                    } else {
                                      setStudentsToDelete([]);
                                    }
                                  }}
                                  className="w-5 h-5 rounded cursor-pointer"
                                  style={{ accentColor: '#dc2626' }}
                                />
                              </th>
                            )}
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Army ID</th>
                            <th className="px-4 py-3 text-left">Batch</th>
                            <th className="px-4 py-3 text-left">Regiment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.map((student, index) => (
                            <tr
                              key={student.id}
                              className={`border-b transition-colors ${deleteMode && studentsToDelete.includes(student.id)
                                  ? 'bg-red-50'
                                  : 'hover:bg-green-50'
                                }`}
                            >
                              {deleteMode && (
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={studentsToDelete.includes(student.id)}
                                    onChange={() => toggleStudentForDeletion(student.id)}
                                    className="w-5 h-5 rounded cursor-pointer"
                                    style={{ accentColor: '#dc2626' }}
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 font-semibold" style={{ color: '#074F06' }}>
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {student.name}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {student.army_id}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {student.batch_no}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {student.regiment}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3" style={{ backgroundColor: '#f9fafb' }}>
                {deleteMode ? (
                  <>
                    <button
                      onClick={() => {
                        setDeleteMode(false);
                        setStudentsToDelete([]);
                      }}
                      className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveSelectedStudents}
                      disabled={studentsToDelete.length === 0}
                      className="px-5 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#dc2626' }}
                      onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#b91c1c')}
                      onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#dc2626')}
                    >
                      Remove {studentsToDelete.length > 0 && `(${studentsToDelete.length})`} Student{studentsToDelete.length !== 1 ? 's' : ''}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowViewStudentsModal(false)}
                    className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Docs;
