import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import SubtopicService from "../entities/subtopic";
import CompletionProgressService from '../entities/completionProgress';
import progressAPI from '../entities/progress';
import userService from '../entities/users';
import classService from '../entities/class';
import { FaCheckCircle, FaBook, FaImage, FaVideo, FaGamepad, FaUser, FaGraduationCap, FaCube } from 'react-icons/fa';
import { FiCheck, FiClock } from 'react-icons/fi';

function SubtopicsPage({ classId: propClassId, studentId: propStudentId, embedded = false }) {
  const [subtopics, setSubtopics] = useState([]);
  const [completedSubtopicIds, setCompletedSubtopicIds] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [classProgress, setClassProgress] = useState(null); // PDF, image, video progress

  const [userData, setUserData] = useState({});
  const [classData, setClassData] = useState({});

  const params = useParams();
  const role = localStorage.getItem("role");

  // Use props if provided (embedded mode), otherwise use URL params
  const classId = propClassId || params.classId;
  const studentId = propStudentId || params.studentId || localStorage.getItem("id");

  // Fetch subtopics & progress
  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, progressRes, classProgressRes] = await Promise.all([
          SubtopicService.getSubtopicsByClassId(classId),
          CompletionProgressService.getProgressByStudentAndClass(studentId, classId),
          progressAPI.getClassProgress(studentId, classId)
        ]);

        const userData = await userService.getUserById(studentId);
        setUserData(userData);

        const classData = await classService.getClassInfo(classId);
        setClassData(classData);

        if (subRes.data.success) setSubtopics(subRes.data.data);

        if (progressRes.data.success) {
          const progress = progressRes.data.data;
          setCompletedSubtopicIds(progress.completed_subtopics || []);
          setCompletionPercentage(progress.completion_percentage || 0);
        }

        // Set class progress (PDF, image, video percentages)
        if (classProgressRes.data.success) {
          setClassProgress(classProgressRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    if (classId) fetchData();
  }, [classId, studentId]);

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

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6"} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className={embedded ? "" : "max-w-7xl mx-auto"}>
        {/* Header Section - Only show in standalone mode */}
        {!embedded && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: '#074F06' }}>
                <FaGraduationCap />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">
                  {classData.class_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Track your learning progress</p>
              </div>
            </div>

            {/* User Info for non-students */}
            {role !== "Student" && userData && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Student Name</p>
                    <p className="text-sm font-bold text-gray-800">{userData.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Rank</p>
                    <p className="text-sm font-bold text-gray-800">{userData.rank}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Army No</p>
                    <p className="text-sm font-bold text-gray-800">{userData.army_no}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Unit</p>
                    <p className="text-sm font-bold text-gray-800">{userData.unit}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT SIDE - Document Progress (PDF, Video, Image) */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-100 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: '#074F06' }}>
                  <FaBook size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Study Materials Progress</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">PDFs, Videos & Images</p>
                </div>
              </div>

              {/* Progress Percentages for PDF, Image, Video */}
              {classProgress && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* PDF Progress */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <FaBook size={14} className="text-red-600" />
                      <span className="text-xs font-bold text-gray-700">PDFs</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round(classProgress.pdf_completion_percentage || 0)}%
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${classProgress.pdf_completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Image Progress */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <FaImage size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-gray-700">Images</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(classProgress.image_completion_percentage || 0)}%
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${classProgress.image_completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Video Progress */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <FaVideo size={14} className="text-purple-600" />
                      <span className="text-xs font-bold text-gray-700">Videos</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(classProgress.video_completion_percentage || 0)}%
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${classProgress.video_completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Consolidated Progress Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-100 flex flex-col gap-2 h-full">
              {/* Summary Header with Compact Overall Progress */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#074F06]">Progress Summary</h3>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em]">{classData.class_name || 'Map Reading 1'}</p>
                </div>

                {/* Small Overall Progress Container */}
                <div className="flex items-center gap-3 bg-[#D5F2D5] px-4 py-2.5 rounded-2xl border-2 border-[#074F06]/10 shadow-sm">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10 transform -rotate-90 absolute">
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="rgba(7, 79, 6, 0.1)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="#074F06"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 18}`}
                        strokeDashoffset={`${2 * Math.PI * 18 * (1 - completionPercentage / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <span className="text-[10px] font-black text-[#074F06] relative">
                      {Math.round(completionPercentage)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[#074F06]/60 uppercase tracking-tighter leading-none">Overall</span>
                    <span className="text-[10px] font-bold text-[#074F06] leading-tight">Progress</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-100 shadow-sm transition-all hover:border-green-300">
                  <div className="text-xl font-black text-[#074F06]">
                    {completedSubtopicIds.length}
                  </div>
                  <p className="text-[9px] text-[#074F06]/60 font-black mt-1 uppercase tracking-wider">Completed</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-100 shadow-sm transition-all hover:border-gray-200">
                  <div className="text-xl font-black text-gray-400">
                    {subtopics.length - completedSubtopicIds.length}
                  </div>
                  <p className="text-[9px] text-gray-500 font-black mt-1 uppercase tracking-wider">Remaining</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-sm transition-all hover:border-green-300">
                  <div className="text-xl font-black" style={{ color: '#074F06' }}>
                    {subtopics.length}
                  </div>
                  <p className="text-[9px] font-black mt-1 uppercase tracking-wider" style={{ color: '#074F06', opacity: 0.6 }}>Total</p>
                </div>
              </div>

              {/* Models/Subtopics Section - Moved from left side with original UI */}
              {displayUnitySubtopics.length > 0 && (
                <div className="mt-3 pt-3 border-t-2 border-green-100">
                  <div className="space-y-3">
                    {displayUnitySubtopics.map(subtopic => {
                      const isCompleted = completedSubtopicIds.includes(subtopic.id);
                      return (
                        <div
                          key={subtopic.id}
                          className={`rounded-xl p-4 border-2 transition-all duration-200 shadow-sm hover:shadow-md ${isCompleted
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                            : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                <FaImage size={20} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-base">
                                  {subtopic.subtopic_name}
                                </h3>
                                {isCompleted && (
                                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                    <FiCheck size={14} /> Completed
                                  </p>
                                )}
                              </div>
                            </div>

                            {!isCompleted ? (
                              <button
                                onClick={() => handleComplete(subtopic.subtopic_name)}
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                                style={{ backgroundColor: '#2ecc71' }}
                                title="Mark as Complete"
                              >
                                <FaCheckCircle size={22} />
                              </button>
                            ) : (
                              <div className="text-4xl">✅</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubtopicsPage;
