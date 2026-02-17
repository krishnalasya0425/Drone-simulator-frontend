
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classAPI from "../../entities/class";
import api from "../../entities/axios";
import DocumentViewerWithProgress from "../../components/DocumentViewerWithProgress";
import UploadDocs from "../../components/UploadDocs";
import LaunchingAnimation from "../../components/LaunchingAnimation";
import {
  FaFilePdf,
  FaFileImage,
  FaFile,
  FaUpload,
  FaFolderOpen,
  FaEye,
  FaTrash,
  FaUserPlus,
  FaUsers,
  FaCheckCircle,
  FaVrCardboard,
  FaVideo,
  FaRobot,
  FaMicrochip
} from "react-icons/fa";
import { FiGrid, FiList, FiX, FiArrowRight, FiActivity, FiLayers, FiCpu, FiHash, FiShield, FiZap } from "react-icons/fi";

const Docs = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [classData, setClassData] = useState({});
  const [docType, setDocType] = useState(null);
  const [uploadDoc, setUploadDoc] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [activeFilter, setActiveFilter] = useState("all"); // all, pdf, image

  // Student management states
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [studentsToDelete, setStudentsToDelete] = useState([]);

  // Practice/VR launch states
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchMode, setLaunchMode] = useState("vr"); // "practice" or "vr"

  // Unity build management states
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [buildPath, setBuildPath] = useState("");
  const [buildName, setBuildName] = useState("");
  const [existingBuilds, setExistingBuilds] = useState({ practice: null });
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [showDeleteBuildModal, setShowDeleteBuildModal] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState(null);

  // Validation error modal states
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationError, setValidationError] = useState({
    message: '',
    missing: [],
    found: [],
    details: ''
  });


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
    loadUnityBuilds(); // Load Unity builds for all users (students need this to enable Practice button)
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
        studentIds: selectedStudents,
        userRole: role // Pass role for permission check
      });
      alert(`Successfully added ${selectedStudents.length} student(s) to the class!`);
      setSelectedStudents([]);
      setShowAddStudentsModal(false);
      await loadClassStudents();
    } catch (err) {
      console.error("Failed to add students", err);
      const errorMsg = err.response?.data?.error || "Failed to add students. Please try again.";
      alert(errorMsg);
    }
  };

  const getFileIcon = (mime) => {
    if (!mime) return <FaFile size={40} className="text-[#00C2C7]/40" />;
    if (mime.includes("pdf")) return <FaFilePdf size={40} className="text-[#00C2C7]" />;
    if (mime.startsWith("image")) return <FaFileImage size={40} className="text-[#00C2C7]" />;
    if (mime.startsWith("video")) return <FaVideo size={40} className="text-[#00C2C7]" />;
    return <FaFile size={40} className="text-[#00C2C7]/40" />;
  };

  const renderFileThumbnail = (doc, isSmall = false) => {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fileURL = doc.file_url || `${BASE_URL}/classes/docs/file/${doc.id}${token ? `?token=${token}` : ''}`;

    const handleImageError = (e) => {
      e.target.parentElement.classList.add('bg-[#0a2533]');
      e.target.style.display = 'none';
      if (e.target.nextSibling) {
        e.target.nextSibling.style.display = 'flex';
      }
    };

    if (doc.file_type?.startsWith('image')) {
      return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black group">
          <img
            src={fileURL}
            alt={doc.doc_title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:opacity-30 group-hover:blur-sm"
            onError={handleImageError}
          />
          <div className="hidden absolute inset-0 items-center justify-center bg-[#0a2533] flex-col gap-2">
            {getFileIcon(doc.file_type)}
            <span className="text-[10px] text-[#00C2C7]/40 font-black uppercase tracking-widest">No Signal</span>
          </div>
          {!isSmall && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full border border-[#00C2C7]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 bg-[#00C2C7]/10 backdrop-blur-md">
                <FaEye className="text-[#00C2C7]" size={24} />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (doc.file_type?.startsWith('video')) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center group">
          <video
            src={`${fileURL}#t=0,2`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-all duration-700"
            muted
            autoPlay
            loop
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[#00C2C7] flex items-center justify-center shadow-[0_0_30px_rgba(0,194,199,0.5)] transition-all duration-500 group-hover:scale-110">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#061E29] border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      );
    }

    if (doc.file_type?.includes('pdf')) {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-[#0a2533] group-hover:bg-[#0d2e3d] transition-colors relative ${isSmall ? 'gap-0' : 'gap-4'}`}>
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <FaFilePdf size={200} className="text-[#00C2C7] -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className={`${isSmall ? 'p-1' : 'p-6'} rounded-3xl bg-[#00C2C7]/10 shadow-inner transition-all duration-500 group-hover:scale-110 border border-[#00C2C7]/20 group-hover:border-[#00C2C7]/40 z-10`}>
            <FaFilePdf size={isSmall ? 20 : 48} className="text-[#00C2C7]" />
          </div>
          {!isSmall && (
            <span className="text-[10px] text-[#00C2C7]/60 font-black uppercase tracking-[0.3em] z-10 italic">Intelligence Report</span>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a2533]">
        {getFileIcon(doc.file_type)}
      </div>
    );
  };

  const getFileTypeLabel = (mime) => {
    if (!mime) return "Unknown";
    if (mime.includes("pdf")) return "PDF Document";
    if (mime.startsWith("image")) return "Image";
    if (mime.startsWith("video")) return "Video";
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

  const studentId = localStorage.getItem('id');
  console.log(studentId)

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
        data: {
          studentIds: studentsToDelete,
          userRole: role // Pass role for permission check
        }
      });
      alert(`Successfully removed ${studentsToDelete.length} student(s) from the class!`);
      setStudentsToDelete([]);
      setDeleteMode(false);
      await loadClassStudents();
    } catch (err) {
      console.error("Failed to remove students", err);
      const errorMsg = err.response?.data?.error || "Failed to remove students. Please try again.";
      alert(errorMsg);
    }
  };



  // Load existing Unity builds for this class
  const loadUnityBuilds = async () => {
    try {
      setLoadingBuilds(true);
      const response = await api.get(`/unity/builds/${classId}`);
      const builds = response.data.builds || [];

      const buildsObj = {
        practice: builds.find(b => b.build_type === 'practice') || null
      };

      setExistingBuilds(buildsObj);
    } catch (err) {
      console.error('Failed to load Unity builds:', err);
      setExistingBuilds({ practice: null });
    } finally {
      setLoadingBuilds(false);
    }
  };



  // Add/Update Unity build
  const handleSaveBuild = async () => {
    if (!buildPath.trim()) {
      alert('Please enter a build path');
      return;
    }

    try {
      const uploaded_by = localStorage.getItem("id");

      await api.post('/unity/builds', {
        class_id: classId,
        build_type: 'practice',
        build_path: buildPath.trim(),
        build_name: buildName.trim() || undefined,
        uploaded_by
      });

      alert('Practice build path saved successfully!');
      setBuildPath('');
      setBuildName('');
      setShowBuildModal(false);
      await loadUnityBuilds();
    } catch (err) {
      console.error('Failed to save build:', err);

      // Show detailed validation error if available
      if (err.response?.data?.missing) {
        setValidationError({
          message: err.response.data.message,
          missing: err.response.data.missing,
          found: err.response.data.found || [],
          details: err.response.data.details || '',
          errorType: 'validation'
        });
        setShowValidationErrorModal(true);
      } else if (err.response?.data?.message) {
        // Check for common errors
        const errorMsg = err.response.data.message;

        if (errorMsg.includes('ENOTDIR') || errorMsg.includes('not a directory')) {
          setValidationError({
            message: 'Invalid Path',
            missing: [],
            found: [],
            details: 'You must provide the path to the BUILD FOLDER, not the .exe file.\n\n✅ Correct: C:\\Builds\\MyGame\n❌ Wrong: C:\\Builds\\MyGame\\MyGame.exe\n\nPlease remove the .exe filename from the path and try again.',
            errorType: 'path'
          });
          setShowValidationErrorModal(true);
        } else if (errorMsg.includes('does not exist')) {
          setValidationError({
            message: 'Path Not Found',
            missing: [],
            found: [],
            details: 'The specified path does not exist on the server.\n\nPlease check:\n• Path is correct\n• No typos in the path\n• Folder exists on this computer',
            errorType: 'notfound'
          });
          setShowValidationErrorModal(true);
        } else {
          setValidationError({
            message: 'Error',
            missing: [],
            found: [],
            details: errorMsg,
            errorType: 'generic'
          });
          setShowValidationErrorModal(true);
        }
      } else {
        setValidationError({
          message: 'Failed to save build path',
          missing: [],
          found: [],
          details: 'Please check the path and try again.',
          errorType: 'generic'
        });
        setShowValidationErrorModal(true);
      }
    }
  };

  // Delete Unity build
  const handleDeleteBuild = async () => {
    if (!buildToDelete) return;

    try {
      const response = await api.delete(`/unity/builds/${classId}/${buildToDelete.build_type}?delete_files=true`);

      const data = response.data;
      const message = data.files_deleted
        ? `${buildToDelete.build_type} build deleted successfully!\n\n✅ Build files have been permanently deleted from your PC.`
        : `${buildToDelete.build_type} build deleted successfully!${data.deletion_error ? `\n\n⚠️ Database entry removed, but: ${data.deletion_error}` : ''}`;
      alert(message);
      setShowDeleteBuildModal(false);
      setBuildToDelete(null);
      await loadUnityBuilds();
    } catch (err) {
      console.error('Failed to delete build:', err);
      alert('Failed to delete build. Please try again.');
    }
  };



  // Actual backend trigger for VR launch (updated to use new route)
  const handleActualLaunch = async () => {
    try {
      // const url = `http://localhost:5000/unity/practice/${classId}`;
      const url = `http://localhost:5000/unity/practice/${classId}?studentId=${studentId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to launch VR build');
      }


    } catch (err) {
      console.error('Failed to trigger VR build:', err);
      alert(err.message || 'Failed to launch VR build. Please ensure a practice build is configured.');
    }
  };

  // Open the launch flow modal
  const launchVRPractice = () => {
    setLaunchMode("practice");
    setShowLaunchModal(true);
  };


  return (
    <div className="min-h-screen bg-[#061E29] p-8 font-sans text-white overflow-x-hidden relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-[#0a2533]/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 mb-8 border border-[#00C2C7]/20 flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FaRobot size={120} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-[#061E29] text-3xl shadow-[0_0_30px_rgba(0,194,199,0.4)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30">
              <FaFolderOpen />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                {classData.class_name || 'Terminal Output'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C2C7]/10 border border-[#00C2C7]/20 text-[#00C2C7] text-[10px] font-black uppercase tracking-widest">
                  <FiHash size={12} />
                  {docs.length} Assets
                </div>
                {role !== "Student" && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C2C7]/10 border border-[#00C2C7]/20 text-[#00C2C7] text-[10px] font-black uppercase tracking-widest">
                    <FaUsers size={12} />
                    {classStudents.length} Personnel
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            {role !== "Student" && (
              <>
                <div className="flex items-center p-1 bg-[#061E29]/50 rounded-2xl border border-white/5 shadow-inner">
                  <button
                    onClick={() => navigate(`/${classId}/subtopics`)}
                    className="flex items-center gap-2 px-6 py-3 text-[#00C2C7] hover:bg-[#00C2C7]/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <FiLayers size={14} />
                    Protocols
                  </button>
                  <button
                    className="flex items-center gap-2 px-6 py-3 text-[#061E29] bg-[#00C2C7] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(0,194,199,0.4)] active:scale-95 shadow-lg"
                    onClick={() => setUploadDoc(true)}
                  >
                    <FaUpload size={14} />
                    Initialize
                  </button>
                </div>

                <div className="flex items-center p-1 bg-[#061E29]/50 rounded-2xl border border-white/5 shadow-inner">
                  {role === "admin" && (
                    <button
                      className="flex items-center gap-2 px-6 py-3 text-[#00C2C7] hover:bg-[#00C2C7]/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                      onClick={handleAddStudentsClick}
                    >
                      <FaUserPlus size={14} />
                      Recruit
                    </button>
                  )}
                  <button
                    className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    onClick={handleViewStudentsClick}
                  >
                    <FaUsers size={14} />
                    Personnel
                  </button>
                </div>
              </>
            )}

            {role === "Student" && (
              <button
                onClick={() => navigate(`/${classId}/${studentId}/progress`)}
                className="flex items-center gap-3 px-8 py-4 bg-[#00C2C7] text-[#061E29] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-[0_0_30px_rgba(0,194,199,0.5)] transition-all active:scale-95"
              >
                <FiActivity size={18} className="stroke-[3]" />
                Efficiency Metrics
              </button>
            )}

            {/* Tactical Launch Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${existingBuilds.practice ? 'bg-gradient-to-r from-[#00C2C7] to-[#0099a3] text-[#061E29] shadow-[0_0_20px_rgba(0,194,199,0.3)]' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
                onClick={() => { setLaunchMode("practice"); setShowLaunchModal(true); }}
                disabled={!existingBuilds.practice}
              >
                <FaVrCardboard size={18} />
                Engage Simulator
                {!existingBuilds.practice && <span className="text-[8px] opacity-40 ml-1 italic">(Offline)</span>}
              </button>

              {role === "Instructor" && (
                <div className="flex gap-2">
                  {!existingBuilds.practice ? (
                    <button
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#00C2C7]/10 text-[#00C2C7] border border-[#00C2C7]/20 hover:bg-[#00C2C7] hover:text-[#061E29] transition-all"
                      onClick={() => setShowBuildModal(true)}
                      title="Calibrate Simulator"
                    >
                      <FiCpu size={20} />
                    </button>
                  ) : (
                    <button
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      onClick={() => {
                        setBuildToDelete(existingBuilds.practice);
                        setShowDeleteBuildModal(true);
                      }}
                      title="Decommission Simulator"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Selection & Diagnostics */}
        <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all border ${activeFilter === 'pdf' ? 'bg-[#00C2C7] text-[#061E29] border-[#00C2C7] shadow-[0_8px_20px_rgba(0,194,199,0.3)]' : 'bg-[#061E29] text-[#00C2C7]/60 border-white/5 hover:border-[#00C2C7]/30'}`}
              onClick={() => setActiveFilter(activeFilter === 'pdf' ? 'all' : 'pdf')}
            >
              <FaFilePdf size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Intelligence</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/20 font-mono">{docs.filter(d => d.file_type?.includes('pdf')).length}</span>
            </div>

            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all border ${activeFilter === 'image' ? 'bg-[#00C2C7] text-[#061E29] border-[#00C2C7] shadow-[0_8px_20px_rgba(0,194,199,0.3)]' : 'bg-[#061E29] text-[#00C2C7]/60 border-white/5 hover:border-[#00C2C7]/30'}`}
              onClick={() => setActiveFilter(activeFilter === 'image' ? 'all' : 'image')}
            >
              <FaFileImage size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Visuals</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/20 font-mono">{docs.filter(d => d.file_type?.startsWith('image')).length}</span>
            </div>

            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all border ${activeFilter === 'video' ? 'bg-[#00C2C7] text-[#061E29] border-[#00C2C7] shadow-[0_8px_20px_rgba(0,194,199,0.3)]' : 'bg-[#061E29] text-[#00C2C7]/60 border-white/5 hover:border-[#00C2C7]/30'}`}
              onClick={() => setActiveFilter(activeFilter === 'video' ? 'all' : 'video')}
            >
              <FaVideo size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Feeds</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/20 font-mono">{docs.filter(d => d.file_type?.startsWith('video')).length}</span>
            </div>
          </div>

          <div className="flex items-center p-1.5 bg-[#061E29] rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#00C2C7] text-[#061E29] shadow-lg' : 'text-[#00C2C7]/40 hover:text-[#00C2C7]'}`}
              title="Matrix View"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#00C2C7] text-[#061E29] shadow-lg' : 'text-[#00C2C7]/40 hover:text-[#00C2C7]'}`}
              title="Registry View"
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Assets Matrix */}
        {docs.length === 0 ? (
          <div className="bg-[#0a2533]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-[#00C2C7]/10 border border-[#00C2C7]/20 flex items-center justify-center text-[#00C2C7] mx-auto mb-8 shadow-[0_0_30px_rgba(0,194,199,0.1)]">
              <FaFolderOpen size={48} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Database Empty</h3>
            <p className="text-[#00C2C7]/40 text-xs font-black uppercase tracking-[0.3em] mt-4 mb-10">No intelligence assets registered in this unit</p>
            {role !== "Student" && (
              <button
                onClick={() => setUploadDoc(true)}
                className="bg-[#00C2C7] text-[#061E29] px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-[0_0_30px_rgba(0,194,199,0.4)] transition-all active:scale-95"
              >
                Initalize Asset
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {docs
                  .filter(doc => {
                    if (activeFilter === 'pdf') return doc.file_type?.includes('pdf');
                    if (activeFilter === 'image') return doc.file_type?.startsWith('image');
                    if (activeFilter === 'video') return doc.file_type?.startsWith('video');
                    return true;
                  })
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#00C2C7]/30 hover:shadow-[0_0_40px_rgba(0,194,199,0.1)] flex flex-col h-full relative border border-transparent"
                      onClick={() => {
                        if (doc.file_type.includes("pdf") || doc.file_type.startsWith("image") || doc.file_type.startsWith("video")) {
                          setPreviewId(doc.id);
                          setDocType(doc.file_type);
                        }
                      }}
                    >
                      <div className="h-56 relative overflow-hidden group-hover:cursor-pointer">
                        {renderFileThumbnail(doc)}

                        {role !== "Student" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(doc.id, doc.doc_title);
                            }}
                            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-red-500/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-20 shadow-lg scale-75 group-hover:scale-100"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiZap className="text-[#00C2C7] text-xs" />
                          <span className="text-[9px] font-black text-[#00C2C7]/40 uppercase tracking-[0.2em]">Asset Unit 0{doc.id % 9 + 1}</span>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-[#00C2C7] transition-colors line-clamp-2">
                          {doc.doc_title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2C7] animate-pulse"></span>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{getFileTypeLabel(doc.file_type)}</span>
                          </div>
                          <FiArrowRight className="text-[#00C2C7]/40 group-hover:text-[#00C2C7] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {docs
                  .filter(doc => {
                    if (activeFilter === 'pdf') return doc.file_type?.includes('pdf');
                    if (activeFilter === 'image') return doc.file_type?.startsWith('image');
                    if (activeFilter === 'video') return doc.file_type?.startsWith('video');
                    return true;
                  })
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="group bg-[#0a2533]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/5 p-4 flex items-center gap-6 transition-all duration-300 hover:border-[#00C2C7]/30 hover:bg-[#0a2533]/60 cursor-pointer"
                      onClick={() => {
                        if (doc.file_type.includes("pdf") || doc.file_type.startsWith("image") || doc.file_type.startsWith("video")) {
                          setPreviewId(doc.id);
                          setDocType(doc.file_type);
                        }
                      }}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0">
                        {renderFileThumbnail(doc, true)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FiHash className="text-[#00C2C7]/40" size={12} />
                          <span className="text-[9px] font-black text-[#00C2C7]/40 uppercase tracking-widest italic">{getFileTypeLabel(doc.file_type)}</span>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter truncate group-hover:text-[#00C2C7] transition-colors">{doc.doc_title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        {role !== "Student" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(doc.id, doc.doc_title);
                            }}
                            className="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center border border-white/5"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-[#00C2C7]/10 text-[#00C2C7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-[#00C2C7]/20">
                          <FiArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewId && (
        <DocumentViewerWithProgress
          doc={docs.find(d => d.id === previewId)}
          classId={classId}
          studentId={localStorage.getItem("id")}
          onClose={() => setPreviewId(null)}
        />
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
                            <span>Army No: {student.army_no}</span>
                            <span>Course No: {student.course_no || '-'}</span>
                            <span>Unit: {student.unit || '-'}</span>
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
                  {/* Add Students button - Admin only */}
                  {role === "admin" && (
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
                  )}
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
                    {/* Delete mode toggle - Admin only */}
                    {!deleteMode && role === "admin" && (
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
                          <th className="px-4 py-3 text-left">Rank</th>
                          <th className="px-4 py-3 text-left">Army No</th>
                          <th className="px-4 py-3 text-left">Course No</th>
                          <th className="px-4 py-3 text-left">Unit</th>
                          <th className="px-4 py-3 text-center">Progress</th>
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
                              {student.rank || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {student.army_no}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {student.course_no}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {student.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => window.location.href = `/${classId}/${student.id}/progress`}
                                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:shadow-md transition-all"
                                style={{ backgroundColor: '#074F06' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                              >
                                View Progress
                              </button>
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




      {/* Add/Update Build Modal */}
      {showBuildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#D5F2D5' }}>
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                <FaVrCardboard size={24} />
                {existingBuilds.practice ? 'Update' : 'Add'} Practice Build
              </h2>
              <button
                onClick={() => {
                  setShowBuildModal(false);
                  setBuildPath('');
                  setBuildName('');
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <FiX size={24} style={{ color: '#074F06' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {existingBuilds.practice && (
                <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Current Build:</p>
                  <p className="text-sm text-blue-700 font-mono break-all">{existingBuilds.practice.build_path}</p>
                  <p className="text-xs text-blue-600 mt-1">Uploaded: {new Date(existingBuilds.practice.uploaded_at).toLocaleString()}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Build Path <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buildPath}
                    onChange={(e) => {
                      // Automatically remove quotes if user pastes path with quotes
                      const value = e.target.value.replace(/^["']|["']$/g, '');
                      setBuildPath(value);
                    }}
                    placeholder="C:\path\to\unity\build\folder"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#074F06] focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full path to the folder containing your Unity build (.exe file)
                  </p>
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    ⚠️ Note: Enter the path without quotes (e.g., C:\Builds\MyApp not "C:\Builds\MyApp")
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    ⚠️ Important: Enter the FOLDER path, not the .exe file path!
                  </p>
                  <div className="mt-2 p-2 rounded bg-green-50 border border-green-200">
                    <p className="text-xs text-green-800">
                      <strong>✅ Correct:</strong> <code className="bg-white px-1 rounded">C:\Builds\MyGame</code>
                    </p>
                  </div>
                  <div className="mt-1 p-2 rounded bg-red-50 border border-red-200">
                    <p className="text-xs text-red-800">
                      <strong>❌ Wrong:</strong> <code className="bg-white px-1 rounded">C:\Builds\MyGame\MyGame.exe</code>
                    </p>
                  </div>

                  {/* Required Files Information */}
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">📋 Required Unity Build Files:</p>
                    <ul className="text-xs text-blue-800 space-y-1 ml-4">
                      <li className="list-disc"><strong>[GameName].exe</strong> - Main executable file</li>
                      <li className="list-disc"><strong>[GameName]_Data/</strong> - Game data folder</li>
                      <li className="list-disc"><strong>UnityPlayer.dll</strong> - Unity runtime library</li>
                    </ul>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      All these files must be present in the build folder for it to be accepted.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Build Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder="My VR Training Build"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#074F06] focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional friendly name for this build
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3" style={{ backgroundColor: '#f9fafb' }}>
              <button
                onClick={() => {
                  setShowBuildModal(false);
                  setBuildPath('');
                  setBuildName('');
                }}
                className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBuild}
                disabled={!buildPath.trim()}
                className="px-5 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
                onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
              >
                {existingBuilds.practice ? 'Update Build' : 'Add Build'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Validation Error Modal */}
      {showValidationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-red-900">
                <span className="text-3xl">❌</span>
                Invalid Unity Build
              </h2>
              <button
                onClick={() => setShowValidationErrorModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <FiX size={24} className="text-red-900" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Message */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{validationError.message}</h3>
                {validationError.details && (
                  <p className="text-gray-700 whitespace-pre-line">{validationError.details}</p>
                )}
              </div>

              {/* Missing Files Section */}
              {validationError.missing && validationError.missing.length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-300">
                  <h4 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                    <span>🚫</span> Missing Required Files
                  </h4>
                  <ul className="space-y-2">
                    {validationError.missing.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-red-800">
                        <span className="text-red-600 font-bold">•</span>
                        <span className="font-mono text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Found Files Section */}
              {validationError.found && validationError.found.length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border-2 border-green-300">
                  <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <span>✅</span> Found Files
                  </h4>
                  <ul className="space-y-2">
                    {validationError.found.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-green-800">
                        <span className="text-green-600 font-bold">•</span>
                        <span className="font-mono text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Help Section */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-2">💡 What to do:</h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li className="list-disc">Ensure you're pointing to the correct build folder</li>
                  <li className="list-disc">Verify all required Unity build files are present</li>
                  <li className="list-disc">Check that the build was exported correctly from Unity</li>
                  <li className="list-disc">Make sure you're providing the folder path, not the .exe file path</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowValidationErrorModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Got it, I'll fix this
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Build Confirmation Modal */}
      {showDeleteBuildModal && buildToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-red-900">
                <FaTrash size={24} />
                Delete Practice Build
              </h2>
              <button
                onClick={() => {
                  setShowDeleteBuildModal(false);
                  setBuildToDelete(null);
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <FiX size={24} className="text-red-900" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-4 font-semibold text-lg">
                  ⚠️ Are you sure you want to permanently delete this practice build?
                </p>

                <div className="p-4 rounded-lg bg-red-50 border-2 border-red-300 mb-4">
                  <p className="text-sm font-bold text-red-900 mb-2">🗑️ WARNING: This action cannot be undone!</p>
                  <p className="text-sm text-red-800 mb-2">
                    This will <strong>permanently delete</strong>:
                  </p>
                  <ul className="text-sm text-red-800 ml-6 list-disc space-y-1">
                    <li>The build configuration from the database</li>
                    <li><strong>All build files from your PC</strong> (including .exe, _Data folder, and all assets)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
                  <p className="text-sm font-semibold text-gray-900 mb-2">📂 Build Location:</p>
                  <p className="text-sm text-gray-800 font-mono break-all">
                    {buildToDelete.build_path}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3" style={{ backgroundColor: '#f9fafb' }}>
              <button
                onClick={() => {
                  setShowDeleteBuildModal(false);
                  setBuildToDelete(null);
                }}
                className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBuild}
                className="px-5 py-2 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: '#dc2626' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Delete Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launching Animation Modal */}
      <LaunchingAnimation
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        onConfirm={launchMode === 'vr' || launchMode === 'practice' ? handleActualLaunch : null}
        mode={launchMode}
      />
    </div>

     
)}

export default Docs;