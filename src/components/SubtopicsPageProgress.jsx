import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import SubtopicService from "../entities/subtopic";
import CompletionProgressService from '../entities/completionProgress';
import progressAPI from '../entities/progress';
import userService from '../entities/users';
import classService from '../entities/class';
import droneTrainingAPI from "../entities/droneTraining";
import { FaCheckCircle, FaBook, FaImage, FaVideo, FaGamepad, FaUser, FaGraduationCap, FaCube, FaRobot, FaMicrochip, FaCamera, FaExpand, FaTimes } from 'react-icons/fa';
import { FiCheck, FiClock, FiActivity, FiLayers, FiTarget, FiBox, FiCheckCircle, FiChevronDown, FiChevronRight, FiCamera } from 'react-icons/fi';

function SubtopicsPage({ classId: propClassId, studentId: propStudentId, embedded = false }) {
  const [subtopics, setSubtopics] = useState([]);
  const [completedSubtopicIds, setCompletedSubtopicIds] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [classProgress, setClassProgress] = useState(null); // PDF, image, video progress

  // Drone training state
  const [droneCategories, setDroneCategories] = useState([]);
  const [selectedDroneCategory, setSelectedDroneCategory] = useState(null);
  const [droneHierarchy, setDroneHierarchy] = useState([]);
  const [fullDroneData, setFullDroneData] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubmodules, setExpandedSubmodules] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Screenshots state
  const [screenshots, setScreenshots] = useState([]);
  const [lightboxScreenshot, setLightboxScreenshot] = useState(null);

  const [userData, setUserData] = useState({});
  const [classData, setClassData] = useState({});

  const params = useParams();
  const role = localStorage.getItem("role");

  // Use props if provided (embedded mode), otherwise use URL params
  const classId = propClassId || params.classId;
  const studentId = propStudentId || params.studentId || localStorage.getItem("id");

  // UNIFIED DATA FETCHING
  useEffect(() => {
    let isMounted = true;

    async function fetchComponentData() {
      if (!classId || !studentId) return;

      try {
        const [
          subRes,
          progressRes,
          classProgressRes,
          categoriesData,
          fullProgressData,
          userDataRes,
          classDataRes,
          screenshotsData
        ] = await Promise.all([
          SubtopicService.getSubtopicsByClassId(classId),
          CompletionProgressService.getProgressByStudentAndClass(studentId, classId),
          progressAPI.getClassProgress(studentId, classId),
          droneTrainingAPI.getAllCategories(),
          droneTrainingAPI.getStudentProgress(studentId, classId),
          userService.getUserById(studentId),
          classService.getClassInfo(classId),
          droneTrainingAPI.getScreenshots(studentId, classId)
        ]);

        if (!isMounted) return;

        // 1. Basic Progress Data
        if (subRes.data.success) setSubtopics(subRes.data.data);
        if (progressRes.data.success) {
          const progress = progressRes.data.data;
          setCompletedSubtopicIds(progress.completed_subtopics || []);
          setCompletionPercentage(progress.completion_percentage || 0);
        }
        if (classProgressRes.data.success) setClassProgress(classProgressRes.data.data);

        // 2. User & Class Metadata
        setUserData(userDataRes);
        setClassData(classDataRes);

        // 3. Drone Training Data
        setDroneCategories(categoriesData);
        setFullDroneData(fullProgressData);

        // 4. Screenshots
        setScreenshots(screenshotsData);

        // 4. Initial Drone Category Selection (Only if not already set)
        setSelectedDroneCategory(prev => {
          if (prev) return prev;
          if (categoriesData.length > 0) return categoriesData[0];
          if (fullProgressData.length > 0) return fullProgressData[0];
          return null;
        });

      } catch (err) {
        console.error('Error fetching component data:', err);
      }
    }

    fetchComponentData();
    return () => { isMounted = false; };
  }, [classId, studentId, refreshTrigger]);

  // AUTO-POLL: Re-fetch drone training progress every 10 seconds
  // so the UI updates automatically when Unity/AR-VR sends completion data
  useEffect(() => {
    if (!classId || !studentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const freshProgressData = await droneTrainingAPI.getStudentProgress(studentId, classId);
        setFullDroneData(freshProgressData);
      } catch (err) {
        // Silent fail on poll — don't disrupt the UI
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(pollInterval);
  }, [classId, studentId]);

  // DERIVED HIERARCHY EFFECT
  useEffect(() => {
    if (selectedDroneCategory && fullDroneData.length > 0) {
      const currentCatData = fullDroneData.find(c => c.id === selectedDroneCategory.id);
      setDroneHierarchy(currentCatData?.modules || []);
    } else {
      setDroneHierarchy([]);
    }
  }, [selectedDroneCategory?.id, fullDroneData]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleSubmodule = (submoduleId) => {
    setExpandedSubmodules(prev => ({
      ...prev,
      [submoduleId]: !prev[submoduleId]
    }));
  };

  // Handle completing a subtopic
  const handleComplete = async (subtopicName) => {
    try {
      const res = await CompletionProgressService.createOrUpdateProgress({
        user_id: studentId,
        class_id: parseInt(classId),
        subtopic_name: subtopicName
      });

      if (res.data.success) {
        const completedSubtopic = subtopics.find(s => s.subtopic_name === subtopicName);
        if (completedSubtopic) {
          setCompletedSubtopicIds(prev => {
            const updated = [...prev, completedSubtopic.id];
            const total = subtopics.length;
            setCompletionPercentage(parseFloat(((updated.length / total) * 100).toFixed(2)));
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  // Split subtopics: PDFs/Videos/Images go to left (for progress bars only), everything else goes to right (as models)
  const documentSubtopics = subtopics.filter(s =>
    s.subtopic_name.toLowerCase().includes('pdf') ||
    s.subtopic_name.toLowerCase().includes('video') ||
    s.subtopic_name.toLowerCase().includes('image')
  );

  // All other subtopics (Cardinal Points, Compass Prismatic, etc.) are models for the right side
  const modelSubtopics = subtopics.filter(s =>
    !s.subtopic_name.toLowerCase().includes('pdf') &&
    !s.subtopic_name.toLowerCase().includes('video') &&
    !s.subtopic_name.toLowerCase().includes('image')
  );

  // Use the filtered lists
  const displayDocumentSubtopics = documentSubtopics;
  const displayUnitySubtopics = modelSubtopics;

  // Compute drone training stats — deduplicate by unique progress key to avoid counting same unit multiple times
  const droneStats = React.useMemo(() => {
    let total = 0;
    const completedKeys = new Set();
    const seenLeafKeys = new Set();

    fullDroneData.forEach(category => {
      (category.modules || []).forEach(module => {
        (module.submodules || []).forEach(submodule => {
          const subSubmodules = submodule.subsubmodules || [];
          if (subSubmodules.length > 0) {
            subSubmodules.forEach(ssm => {
              const key = `${module.id}_${submodule.id}_${ssm.id}`;
              if (!seenLeafKeys.has(key)) {
                seenLeafKeys.add(key);
                total++;
                const p = ssm.progress;
                if (p && (p.completed === 1 || p.completed === true)) completedKeys.add(key);
              }
            });
          } else {
            const key = `${module.id}_${submodule.id}_null`;
            if (!seenLeafKeys.has(key)) {
              seenLeafKeys.add(key);
              total++;
              const p = submodule.progress;
              if (p && (p.completed === 1 || p.completed === true)) completedKeys.add(key);
            }
          }
        });
      });
    });

    const completed = completedKeys.size;
    return { total, completed, pending: total - completed };
  }, [fullDroneData]);

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#061E29] p-8 font-sans text-white overflow-x-hidden relative"}>
      {/* Background Decorative Elements */}
      {!embedded && (
        <>
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        </>
      )}

      <div className={embedded ? "" : "max-w-7xl mx-auto relative z-10"}>
        {/* Header Section */}
        {!embedded && (
          <div className="bg-[#0a2533]/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 mb-8 border border-[#00C2C7]/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaRobot size={120} />
            </div> */}

            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-[#061E29] text-4xl shadow-[0_0_30px_rgba(0,194,199,0.4)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30 transition-transform hover:rotate-6">
                <FaGraduationCap />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                  {classData.class_name || 'Operational Training'}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="h-0.5 w-12 bg-[#00C2C7]"></span>
                  <p className="text-[#00C2C7] font-black text-xs uppercase tracking-[0.4em]">Unit Competency Tracking</p>
                </div>
              </div>
            </div>

            {/* User Info HUD */}
            {role !== "Student" && userData.name && (
              <div className="flex gap-4 relative z-10">
                <div className="bg-[#061E29]/50 backdrop-blur-md border border-[#00C2C7]/10 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                  <span className="text-[9px] font-black text-[#00C2C7]/60 uppercase tracking-widest mb-1">Operator</span>
                  <span className="text-sm font-bold text-white uppercase italic tracking-wider">{userData.name}</span>
                </div>
                <div className="bg-[#061E29]/50 backdrop-blur-md border border-[#00C2C7]/10 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                  <span className="text-[9px] font-black text-[#00C2C7]/60 uppercase tracking-widest mb-1">Rank</span>
                  <span className="text-sm font-bold text-white uppercase italic tracking-wider">{userData.rank || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - DOCUMENTS */}
          <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/30 bg-[#00C2C7]/10 shadow-[0_0_15px_rgba(0,194,199,0.1)]">
                <FaBook size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Study Materials HUD</h2>
                <p className="text-[10px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">Theoretical Knowledge Matrix</p>
              </div>
            </div>

            {classProgress && (
              <div className="grid grid-cols-1 gap-4">
                {/* PDF Progress */}
                <div className="bg-[#061E29]/80 rounded-2xl p-6 border border-white/5 hover:border-[#00C2C7]/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <FaBook size={18} />
                      </div>
                      <span className="font-black text-white uppercase italic tracking-wider">Tactical Manuals (PDF)</span>
                    </div>
                    <span className="text-2xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{Math.round(classProgress.pdf_completion_percentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      style={{ width: `${classProgress.pdf_completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Image Progress */}
                <div className="bg-[#061E29]/80 rounded-2xl p-6 border border-white/5 hover:border-[#00C2C7]/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                        <FaImage size={18} />
                      </div>
                      <span className="font-black text-white uppercase italic tracking-wider">Visual Intelligence (IMG)</span>
                    </div>
                    <span className="text-2xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{Math.round(classProgress.image_completion_percentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={{ width: `${classProgress.image_completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Video Progress */}
                <div className="bg-[#061E29]/80 rounded-2xl p-6 border border-white/5 hover:border-[#00C2C7]/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                        <FaVideo size={18} />
                      </div>
                      <span className="font-black text-white uppercase italic tracking-wider">Mission Briefings (VID)</span>
                    </div>
                    <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{Math.round(classProgress.video_completion_percentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      style={{ width: `${classProgress.video_completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - SUMMARY AND MODELS */}
          <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-8">
            {/* HUD HEADER */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mission Readiness</h2>
                <p className="text-[10px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">Operational Status Summary</p>
              </div>

              {/* Radial Progress HUD */}
              <div className="flex items-center gap-4 bg-[#061E29]/80 border border-[#00C2C7]/20 px-6 py-4 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90 absolute">
                    <circle cx="28" cy="28" r="25" stroke="rgba(0, 194, 199, 0.05)" strokeWidth="4" fill="none" />
                    <circle
                      cx="28" cy="28" r="25" stroke="#00C2C7" strokeWidth="4" fill="none"
                      strokeDasharray={`${2 * Math.PI * 25}`}
                      strokeDashoffset={`${2 * Math.PI * 25 * (1 - (droneStats.total > 0 ? droneStats.completed / droneStats.total : 0))}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                      style={{ filter: 'drop-shadow(0 0 5px #00C2C7)' }}
                    />
                  </svg>
                  <span className="text-sm font-black text-[#00C2C7] relative">
                    {droneStats.total > 0 ? Math.round((droneStats.completed / droneStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Overall</span>
                  <span className="text-xs font-black text-[#00C2C7] uppercase italic leading-tight">Mastery</span>
                </div>
              </div>
            </div>

            {/* STATS HUD */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#061E29]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-[#00C2C7]">{droneStats.completed}</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Verified</span>
              </div>
              <div className="bg-[#061E29]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-white/60">{droneStats.pending}</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Pending</span>
              </div>
              <div className="bg-[#061E29]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-white">{droneStats.total}</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Total Units</span>
              </div>
            </div>

            {/* DRONE TRAINING HIERARCHICAL VIEW */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-[#00C2C7] uppercase tracking-[0.5em] flex items-center gap-3">
                  <FiBox /> Tactical Simulations
                </h3>
                <button
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#00C2C7]/20 text-[#00C2C7] border border-[#00C2C7]/30 hover:bg-[#00C2C7] hover:text-[#061E29] transition-all flex items-center gap-2"
                  title="Refresh progress data"
                >
                  <FiActivity /> Refresh
                </button>
              </div>


              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {droneHierarchy.length === 0 ? (
                  <div className="text-center py-10 text-white/20 italic text-sm border border-dashed border-white/5 rounded-2xl">
                    No modules available for this category
                  </div>
                ) : (
                  droneHierarchy.map((module) => {
                    const isExpanded = expandedModules[module.id];
                    const hasSubmodules = module.submodules && module.submodules.length > 0;
                    const moduleProgress = module.progress;

                    return (
                      <div key={module.id} className="bg-[#061E29]/60 rounded-2xl border border-white/5 overflow-hidden">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {hasSubmodules && (
                              <div className="text-[#00C2C7]">
                                {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                              </div>
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(moduleProgress?.completed === true || moduleProgress?.completed === 1)
                              ? 'bg-[#00C2C7] text-[#061E29]'
                              : 'bg-white/5 text-[#00C2C7]'
                              }`}>
                              <FiBox size={18} />
                            </div>
                            <div className="text-left">
                              <h4 className="font-black text-white text-sm uppercase tracking-tight">
                                {module.module_name}
                              </h4>
                              {(moduleProgress?.completed === true || moduleProgress?.completed === 1) && (
                                <p className="text-xs text-[#00C2C7] flex items-center gap-1 mt-1">
                                  <FiCheck /> Completed
                                  {moduleProgress.score && ` • ${moduleProgress.score}`}
                                </p>
                              )}
                            </div>
                          </div>

                          {(moduleProgress?.completed === true || moduleProgress?.completed === 1) && (
                            <FiCheckCircle className="text-[#00C2C7]" size={20} />
                          )}
                        </button>

                        {/* Submodules */}
                        {isExpanded && hasSubmodules && (
                          <div className="px-4 pb-4 space-y-2">
                            {module.submodules.map((submodule) => {
                              const isSubExpanded = expandedSubmodules[submodule.id];
                              const hasSubSubmodules = submodule.subsubmodules && submodule.subsubmodules.length > 0;
                              const submoduleProgress = submodule.progress;

                              return (
                                <div key={submodule.id} className="ml-6 bg-[#0a2533]/40 rounded-xl border border-white/5">
                                  {/* Submodule Header */}
                                  <button
                                    onClick={() => toggleSubmodule(submodule.id)}
                                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-all"
                                  >
                                    <div className="flex items-center gap-2">
                                      {hasSubSubmodules && (
                                        <div className="text-[#00C2C7]">
                                          {isSubExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                                        </div>
                                      )}
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${(submoduleProgress?.completed === true || submoduleProgress?.completed === 1)
                                        ? 'bg-[#00C2C7] text-[#061E29]'
                                        : 'bg-white/5 text-white/40'
                                        }`}>
                                        <FiTarget size={14} />
                                      </div>
                                      <div className="text-left">
                                        <h5 className="font-bold text-white text-xs">
                                          {submodule.submodule_name}
                                        </h5>
                                        {(submoduleProgress?.completed === true || submoduleProgress?.completed === 1) && submoduleProgress.score && (
                                          <p className="text-xs text-[#00C2C7]">Score: {submoduleProgress.score}</p>
                                        )}
                                      </div>
                                    </div>

                                    {(() => {
                                      const shouldShow = (submoduleProgress?.completed === true || submoduleProgress?.completed === 1);
                                      return shouldShow && <FiCheckCircle className="text-[#00C2C7]" size={16} />;
                                    })()}
                                  </button>

                                  {/* Sub-submodules */}
                                  {isSubExpanded && hasSubSubmodules && (
                                    <div className="px-3 pb-3 space-y-1">
                                      {submodule.subsubmodules.map((subsubmodule) => {
                                        const subsubProgress = subsubmodule.progress;
                                        const isSubSubCompleted = (subsubProgress?.completed === true || subsubProgress?.completed === 1);

                                        return (
                                          <div
                                            key={subsubmodule.id}
                                            className={`ml-4 p-2 rounded-lg flex items-center justify-between ${isSubSubCompleted
                                              ? 'bg-[#00C2C7]/10 border border-[#00C2C7]/30'
                                              : 'bg-[#061E29]/30 border border-white/5'
                                              }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className={`text-[10px] ${isSubSubCompleted ? 'text-[#00C2C7]' : 'text-white/40'}`}>
                                                {subsubmodule.subsubmodule_name}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              {subsubProgress?.score && (
                                                <span className="text-xs text-[#00C2C7] font-bold">
                                                  {subsubProgress.score}
                                                </span>
                                              )}
                                              {isSubSubCompleted && (
                                                <FiCheckCircle className="text-[#00C2C7]" size={14} />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCREENSHOTS SECTION */}
      <div className={embedded ? "mt-6" : "max-w-7xl mx-auto relative z-10 mt-8"}>
        <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/30 bg-[#00C2C7]/10 shadow-[0_0_15px_rgba(0,194,199,0.1)]">
                <FaCamera size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mission Screenshots</h2>
                <p className="text-[10px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">AR/VR Session Captures</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#00C2C7]/10 border border-[#00C2C7]/20 text-[#00C2C7] text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest">
                {screenshots.length} {screenshots.length === 1 ? 'Capture' : 'Captures'}
              </span>
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#00C2C7]/20 text-[#00C2C7] border border-[#00C2C7]/30 hover:bg-[#00C2C7] hover:text-[#061E29] transition-all flex items-center gap-2"
              >
                <FiActivity /> Refresh
              </button>
            </div>
          </div>

          {screenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/20">
                <FaCamera size={28} />
              </div>
              <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No Screenshots Yet</p>
              <p className="text-white/15 text-xs mt-1">Screenshots will appear here when captured from AR/VR sessions</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {screenshots.map((shot) => {
                const imageUrl = droneTrainingAPI.getScreenshotImageUrl(shot.id);
                const label = [shot.module_name, shot.submodule_name, shot.subsubmodule_name].filter(Boolean).join(' › ');
                const capturedAt = new Date(shot.captured_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div
                    key={shot.id}
                    className="group relative bg-[#061E29]/80 rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:border-[#00C2C7]/40 transition-all hover:shadow-[0_0_20px_rgba(0,194,199,0.15)]"
                    onClick={() => setLightboxScreenshot(shot)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                      <img
                        src={imageUrl}
                        alt={label || 'Mission Screenshot'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-white/20 absolute inset-0">
                        <FaCamera size={24} />
                      </div>
                      {/* Expand overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <FaExpand className="text-white" size={20} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      {shot.category_name && (
                        <span className="text-[9px] font-black text-[#00C2C7] uppercase tracking-widest">{shot.category_name}</span>
                      )}
                      {label && (
                        <p className="text-[10px] text-white/70 font-bold mt-0.5 truncate">{label}</p>
                      )}
                      <p className="text-[9px] text-white/30 mt-1">{capturedAt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxScreenshot(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0a2533] rounded-3xl border border-[#00C2C7]/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxScreenshot(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#00C2C7] hover:text-[#061E29] transition-all"
            >
              <FaTimes size={16} />
            </button>

            {/* Image */}
            <div className="w-full bg-black/40">
              <img
                src={droneTrainingAPI.getScreenshotImageUrl(lightboxScreenshot.id)}
                alt="Mission Screenshot"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Info bar */}
            <div className="p-6 flex flex-wrap gap-4 items-center justify-between">
              <div>
                {lightboxScreenshot.category_name && (
                  <span className="text-xs font-black text-[#00C2C7] uppercase tracking-widest">{lightboxScreenshot.category_name}</span>
                )}
                <p className="text-white font-bold mt-1">
                  {[lightboxScreenshot.module_name, lightboxScreenshot.submodule_name, lightboxScreenshot.subsubmodule_name].filter(Boolean).join(' › ') || 'Mission Screenshot'}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Captured: {new Date(lightboxScreenshot.captured_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={droneTrainingAPI.getScreenshotImageUrl(lightboxScreenshot.id)}
                  download={`screenshot-${lightboxScreenshot.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-[#00C2C7] text-[#061E29] hover:bg-[#00a8ad] transition-all"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubtopicsPage;
