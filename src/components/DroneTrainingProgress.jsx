import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import droneTrainingAPI from "../entities/droneTraining";
import userService from '../entities/users';
import classService from '../entities/class';
import {
    FaCheckCircle, FaRobot, FaGraduationCap, FaDrone, FaEye, FaBox,
    FaClock, FaTrophy, FaImage
} from 'react-icons/fa';
import {
    FiCheck, FiCheckCircle, FiClock, FiActivity, FiLayers,
    FiTarget, FiBox, FiChevronDown, FiChevronRight
} from 'react-icons/fi';

function DroneTrainingProgress({ classId: propClassId, studentId: propStudentId, embedded = false }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [hierarchy, setHierarchy] = useState([]);
    const [progressSummary, setProgressSummary] = useState([]);
    const [expandedModules, setExpandedModules] = useState({});
    const [expandedSubmodules, setExpandedSubmodules] = useState({});

    const [userData, setUserData] = useState({});
    const [classData, setClassData] = useState({});

    const params = useParams();
    const role = localStorage.getItem("role");

    // Use props if provided (embedded mode), otherwise use URL params
    const classId = propClassId || params.classId;
    const studentId = propStudentId || params.studentId || localStorage.getItem("id");

    // Fetch categories and summary
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [categoriesData, summaryData, userDataRes, classDataRes] = await Promise.all([
                    droneTrainingAPI.getAllCategories(),
                    droneTrainingAPI.getProgressSummary(studentId, classId),
                    userService.getUserById(studentId),
                    classService.getClassInfo(classId)
                ]);

                setCategories(categoriesData);
                setProgressSummary(summaryData);
                setUserData(userDataRes);
                setClassData(classDataRes);

                // Auto-select first category
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0]);
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
            }
        }

        if (classId && studentId) fetchInitialData();
    }, [classId, studentId]);

    // Fetch hierarchy when category changes
    useEffect(() => {
        async function fetchHierarchy() {
            if (!selectedCategory) return;

            try {
                // Fetch all drone progress data
                const allData = await droneTrainingAPI.getStudentProgress(
                    studentId,
                    classId
                );

                // Filter by selected category
                const categoryData = allData.find(cat => cat.id === selectedCategory.id);
                setHierarchy(categoryData?.modules || []);
            } catch (err) {
                console.error('Error fetching hierarchy:', err);
                setHierarchy([]);
            }
        }

        fetchHierarchy();
    }, [selectedCategory, classId, studentId]);

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

    const getCategoryIcon = (categoryName) => {
        if (categoryName.includes('FPV')) return FaDrone;
        if (categoryName.includes('Surveillance')) return FaEye;
        if (categoryName.includes('Payload')) return FaBox;
        return FaDrone;
    };

    const getCompletionColor = (percentage) => {
        if (percentage >= 80) return 'from-green-500 to-emerald-500';
        if (percentage >= 50) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

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
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaDrone size={120} />
                        </div>

                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-[#061E29] text-4xl shadow-[0_0_30px_rgba(0,194,199,0.4)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30 transition-transform hover:rotate-6">
                                <FaDrone />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                                    Drone Training Progress
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="h-0.5 w-12 bg-[#00C2C7]"></span>
                                    <p className="text-[#00C2C7] font-black text-xs uppercase tracking-[0.4em]">
                                        {classData.class_name || 'Flight Operations'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Info HUD */}
                        {role !== "Student" && userData.name && (
                            <div className="flex gap-4 relative z-10">
                                <div className="bg-[#061E29]/50 backdrop-blur-md border border-[#00C2C7]/10 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                                    <span className="text-[9px] font-black text-[#00C2C7]/60 uppercase tracking-widest mb-1">Pilot</span>
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

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {categories.map((category) => {
                        const summary = progressSummary.find(s => s.categoryId === category.id);
                        const Icon = getCategoryIcon(category.category_name);
                        const isSelected = selectedCategory?.id === category.id;
                        const completionPercentage = summary?.completionPercentage || 0;

                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category)}
                                className={`relative rounded-2xl p-6 border transition-all duration-300 overflow-hidden group ${isSelected
                                    ? 'bg-[#00C2C7]/10 border-[#00C2C7] shadow-[0_0_30px_rgba(0,194,199,0.2)]'
                                    : 'bg-[#0a2533]/40 border-white/5 hover:border-[#00C2C7]/30 hover:bg-[#0a2533]/60'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00C2C7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#00C2C7] text-[#061E29]' : 'bg-white/5 text-[#00C2C7]'
                                            }`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className={`text-2xl font-black ${isSelected ? 'text-[#00C2C7]' : 'text-white/40'
                                            }`}>
                                            {Math.round(completionPercentage)}%
                                        </span>
                                    </div>

                                    <h3 className="font-black text-white text-lg uppercase tracking-tight mb-2">
                                        {category.category_name}
                                    </h3>

                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`bg-gradient-to-r ${getCompletionColor(completionPercentage)} h-full rounded-full transition-all duration-1000`}
                                            style={{ width: `${completionPercentage}%` }}
                                        ></div>
                                    </div>

                                    {summary && (
                                        <p className="text-xs text-white/40 mt-2">
                                            {summary.completedItems} / {summary.totalItems} completed
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Training Modules Hierarchy */}
                {selectedCategory && (
                    <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#00C2C7] border border-[#00C2C7]/30 bg-[#00C2C7]/10 shadow-[0_0_15px_rgba(0,194,199,0.1)]">
                                <FiLayers size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                    {selectedCategory.category_name} Training Modules
                                </h2>
                                <p className="text-[10px] text-[#00C2C7] font-black uppercase tracking-[0.2em] opacity-60">
                                    Hierarchical Progress Tracking
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {hierarchy.map((module) => {
                                const isExpanded = expandedModules[module.id];
                                const hasSubmodules = module.submodules && module.submodules.length > 0;
                                const moduleProgress = module.progress;

                                return (
                                    <div key={module.id} className="bg-[#061E29]/60 rounded-2xl border border-white/5 overflow-hidden">
                                        {/* Module Header */}
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                {hasSubmodules && (
                                                    <div className="text-[#00C2C7]">
                                                        {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                                                    </div>
                                                )}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${moduleProgress?.completed
                                                    ? 'bg-[#00C2C7] text-[#061E29]'
                                                    : 'bg-white/5 text-[#00C2C7]'
                                                    }`}>
                                                    <FiBox size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-white uppercase tracking-tight">
                                                        {module.module_name}
                                                    </h3>
                                                    {moduleProgress?.completed && (
                                                        <p className="text-xs text-[#00C2C7] flex items-center gap-1 mt-1">
                                                            <FiCheck /> Completed
                                                            {moduleProgress.score && ` • Score: ${moduleProgress.score}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {moduleProgress?.completed && (
                                                <FiCheckCircle className="text-[#00C2C7]" size={24} />
                                            )}
                                        </button>

                                        {/* Submodules */}
                                        {isExpanded && hasSubmodules && (
                                            <div className="px-6 pb-6 space-y-3">
                                                {module.submodules.map((submodule) => {
                                                    const isSubExpanded = expandedSubmodules[submodule.id];
                                                    const hasSubSubmodules = submodule.subsubmodules && submodule.subsubmodules.length > 0;
                                                    const submoduleProgress = submodule.progress;

                                                    return (
                                                        <div key={submodule.id} className="ml-8 bg-[#0a2533]/40 rounded-xl border border-white/5">
                                                            {/* Submodule Header */}
                                                            <button
                                                                onClick={() => toggleSubmodule(submodule.id)}
                                                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {hasSubSubmodules && (
                                                                        <div className="text-[#00C2C7]">
                                                                            {isSubExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                                                                        </div>
                                                                    )}
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${submoduleProgress?.completed
                                                                        ? 'bg-[#00C2C7] text-[#061E29]'
                                                                        : 'bg-white/5 text-white/40'
                                                                        }`}>
                                                                        <FiTarget size={16} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h4 className="font-bold text-white text-sm">
                                                                            {submodule.submodule_name}
                                                                        </h4>
                                                                        {submoduleProgress?.completed && submoduleProgress.score && (
                                                                            <p className="text-xs text-[#00C2C7]">Score: {submoduleProgress.score}</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {submoduleProgress?.completed && (
                                                                    <FiCheckCircle className="text-[#00C2C7]" size={20} />
                                                                )}
                                                            </button>

                                                            {/* Sub-submodules */}
                                                            {isSubExpanded && hasSubSubmodules && (
                                                                <div className="px-4 pb-4 space-y-2">
                                                                    {submodule.subsubmodules.map((subsubmodule) => {
                                                                        const subsubProgress = subsubmodule.progress;

                                                                        return (
                                                                            <div
                                                                                key={subsubmodule.id}
                                                                                className={`ml-6 p-3 rounded-lg flex items-center justify-between ${subsubProgress?.completed
                                                                                    ? 'bg-[#00C2C7]/10 border border-[#00C2C7]/30'
                                                                                    : 'bg-[#061E29]/40 border border-white/5'
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${subsubProgress?.completed
                                                                                        ? 'bg-[#00C2C7] text-[#061E29]'
                                                                                        : 'bg-white/5 text-white/30'
                                                                                        }`}>
                                                                                        <FiActivity size={12} />
                                                                                    </div>
                                                                                    <span className="text-sm text-white font-medium">
                                                                                        {subsubmodule.subsubmodule_name}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    {subsubProgress?.score && (
                                                                                        <span className="text-xs text-[#00C2C7] font-bold">
                                                                                            {subsubProgress.score}
                                                                                        </span>
                                                                                    )}
                                                                                    {subsubProgress?.scorecard_image_path && (
                                                                                        <button
                                                                                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${subsubProgress.scorecard_image_path}`, '_blank')}
                                                                                            className="p-1.5 rounded bg-[#00C2C7]/20 text-[#00C2C7] hover:bg-[#00C2C7]/30 transition-all"
                                                                                            title="View Scorecard"
                                                                                        >
                                                                                            <FaImage size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                    {subsubProgress?.completed && (
                                                                                        <FiCheckCircle className="text-[#00C2C7]" size={16} />
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
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DroneTrainingProgress;
