import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classAPI } from "../entities/class";
import test from "../entities/test";
import Users from "../entities/users";
import {
  FaFilePdf,
  FaMagic,
  FaCheckCircle,
  FaListOl,
  FaFileAlt,
  FaArrowLeft,
  FaRandom,
  FaLayerGroup,
} from "react-icons/fa";
import {
  FiUpload,
  FiCheckCircle as FiCheck,
  FiFileText,
  FiList,
  FiClock,
  FiActivity,
  FiLayers
} from "react-icons/fi";

const GenerateTest = () => {
  const { classId: urlClassId } = useParams();
  const navigate = useNavigate();

  // Get user info and URL params
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");
  const queryParams = new URLSearchParams(window.location.search);
  const studentId = queryParams.get("studentId");
  const requestId = queryParams.get("requestId");

  // State management
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(urlClassId || "");
  const [title, setTitle] = useState("");
  const [numberOfSets, setNumberOfSets] = useState(studentId ? 1 : 3);
  const [questionsPerSet, setQuestionsPerSet] = useState(10);
  const [questionBankFile, setQuestionBankFile] = useState(null);
  const [retestStudentName, setRetestStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Exam Config
  const [examConfig, setExamConfig] = useState({
    examType: "UNTIMED",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    passThreshold: 5
  });

  const [studentCount, setStudentCount] = useState(0);
  const [loadingStudentCount, setLoadingStudentCount] = useState(false);

  useEffect(() => {
    if (role === "Instructor" && !urlClassId) {
      loadClasses();
    }
    if (studentId) {
      loadStudentName(studentId);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId && !studentId) {
      loadStudentCount(selectedClassId);
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      const data = await classAPI.getAllClasses(userId);
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes", err);
      setMessage("Failed to load classes");
      setMessageType("error");
    }
  };

  const loadStudentName = async (id) => {
    try {
      const userData = await Users.getUserById(id);
      if (userData && userData.name) {
        setRetestStudentName(userData.name);
        setTitle(`Retest for ${userData.name}`);
      } else {
        setTitle(`Retest for Student #${id}`);
      }
    } catch (err) {
      console.error("Failed to load student name", err);
      setTitle(`Retest for Student #${id}`);
    }
  };

  const loadStudentCount = async (classId) => {
    try {
      setLoadingStudentCount(true);
      const students = await classAPI.getStudentsInClass(classId);
      const count = Array.isArray(students) ? students.length : 0;
      setStudentCount(count);
      if (numberOfSets > count && count > 0) {
        setNumberOfSets(count);
      }
    } catch (err) {
      console.error("Failed to load student count", err);
      setStudentCount(0);
    } finally {
      setLoadingStudentCount(false);
    }
  };

  const handleQuestionBankChange = (file) => {
    setQuestionBankFile(file);
  };

  const AddTest = async () => {
    if (role === "Admin") {
      setMessage("⚠️ Access Denied: Admin restricts. Instructors only.");
      setMessageType("error");
      return;
    }
    if (role !== "Instructor") {
      setMessage("⚠️ Unauthorized: Instructor credentials required.");
      setMessageType("error");
      return;
    }

    if (!title.trim()) {
      setMessage("❌ Mission Designation Required");
      setMessageType("error");
      return;
    }
    if (!selectedClassId) {
      setMessage("❌ Unit Selection Required");
      setMessageType("error");
      return;
    }
    if (!questionBankFile) {
      setMessage("❌ Intelligence Matrix (PDF) Missing");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("🔄 Processing mission data... Stand by.");
      setMessageType("info");

      const res = await test.addTest(title, userId, selectedClassId, studentId, requestId);
      const newTestId = res.testId;

      const formData = new FormData();
      formData.append('questionBank', questionBankFile);
      formData.append('numberOfSets', numberOfSets);
      formData.append('questionsPerSet', questionsPerSet);
      formData.append('examType', examConfig.examType);
      formData.append('passThreshold', examConfig.passThreshold);
      formData.append('classId', selectedClassId);

      if (examConfig.durationMinutes) formData.append('durationMinutes', examConfig.durationMinutes);
      if (examConfig.startTime) formData.append('startTime', examConfig.startTime);
      if (examConfig.endTime) formData.append('endTime', examConfig.endTime);

      const result = await test.generateSetsFromQuestionBank(newTestId, formData);

      setMessage(`✅ Deployment Successful! Created ${result.numberOfSets} randomized sets.`);
      setMessageType("success");
      setTimeout(() => {
        navigate(`/${selectedClassId}/docs`);
      }, 2000);

    } catch (error) {
      console.error('Test creation error:', error);
      const errorMsg = error.message || "Unknown error";
      if (errorMsg.includes("No questions found") || errorMsg.includes("Failed to parse PDF")) {
        setShowFormatModal(true);
      } else {
        setMessage("❌ Mission Failed: " + errorMsg);
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#061E29] p-8 font-sans text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00C2C7]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation / Header */}
        <div className="mb-10 animate-fade-in">
          <button
            onClick={() => navigate(selectedClassId ? `/${selectedClassId}/docs` : '/classes')}
            className="group flex items-center gap-2 mb-6 text-[#00C2C7]/60 hover:text-[#00C2C7] transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Abort to {selectedClassId ? 'HQ Documents' : 'Class Matrix'}</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-6 bg-[#0a2533]/60 backdrop-blur-xl rounded-3xl p-8 border border-[#00C2C7]/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaRandom size={100} />
            </div>

            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[#061E29] text-3xl shadow-[0_0_20px_rgba(0,194,199,0.3)] bg-gradient-to-br from-[#00C2C7] to-[#0099a3] border border-[#00C2C7]/30">
              <FaRandom />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
                {studentId ? 'Initiate Retest' : 'Intelligence Deployment'}
                {studentId && (
                  <span className="text-[10px] bg-[#00C2C7]/20 text-[#00C2C7] px-3 py-1 rounded-full not-italic tracking-[0.2em] border border-[#00C2C7]/30">
                    Individual: {retestStudentName}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="h-0.5 w-12 bg-[#00C2C7]"></span>
                <p className="text-[#00C2C7]/60 font-black text-[10px] uppercase tracking-[0.3em]">Randomized Assessment Protocol v4.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-slide-up border ${messageType === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" :
            messageType === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
              "bg-[#00C2C7]/10 border-[#00C2C7]/30 text-[#00C2C7]"
            }`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center">
              {messageType === "success" ? <FaCheckCircle size={20} /> : <FiActivity size={20} />}
            </div>
            <p className="font-bold text-xs uppercase tracking-wider italic">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 space-y-8 shadow-inner">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Class Selection */}
                {role === "Instructor" && !urlClassId && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#00C2C7] uppercase tracking-widest flex items-center gap-2">
                      <FiList /> Tactical Unit
                    </label>
                    <select
                      className="w-full bg-[#061E29]/80 border border-[#00C2C7]/20 rounded-xl px-4 py-3 outline-none text-white focus:border-[#00C2C7] transition-all font-bold appearance-none cursor-pointer"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      <option value="" className="bg-[#0a2533]">-- Select Sector --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0a2533]">{c.class_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Test Designation */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-[#00C2C7] uppercase tracking-widest flex items-center gap-2">
                    <FiFileText /> Mission Designation
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#061E29]/80 border border-[#00C2C7]/20 rounded-xl px-4 py-3 outline-none text-white focus:border-[#00C2C7] transition-all font-bold placeholder:text-white/20"
                    placeholder="e.g., Tactical Reconnaissance Examination"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* PDF Matrix Upload */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#00C2C7]/10 to-transparent border border-[#00C2C7]/20 hover:border-[#00C2C7]/40 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00C2C7]/20 flex items-center justify-center text-[#00C2C7] group-hover:scale-110 transition-transform">
                    <FaFilePdf size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic">Intelligence Matrix</h3>
                    <p className="text-[9px] text-[#00C2C7]/60 font-black uppercase tracking-widest leading-tight">Universal PDF Question Bank</p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    id="pdf-upload"
                    className="hidden"
                    onChange={(e) => handleQuestionBankChange(e.target.files[0])}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="w-full border-2 border-dashed border-[#00C2C7]/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#00C2C7]/5 hover:border-[#00C2C7] transition-all"
                  >
                    <FiUpload className="text-[#00C2C7] animate-bounce" size={32} />
                    <div className="text-center">
                      <span className="block text-xs font-black text-white uppercase tracking-wider mb-1">
                        {questionBankFile ? questionBankFile.name : 'Upload Data Stream'}
                      </span>
                      <span className="block text-[8px] text-[#00C2C7]/40 uppercase font-black">Drag or click to interface (PDF ONLY)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Set Configuration Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-[#061E29]/50 border border-white/5">
                {!studentId && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#00C2C7] uppercase tracking-widest flex items-center gap-2">
                      <FaLayerGroup /> Tactical Variations
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-xl px-5 py-4 outline-none text-2xl font-black italic text-[#00C2C7] focus:border-[#00C2C7] transition-all"
                        value={numberOfSets}
                        onChange={e => setNumberOfSets(parseInt(e.target.value) || 0)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#00C2C7]/40 uppercase tracking-widest">Sets</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#00C2C7] uppercase tracking-widest flex items-center gap-2">
                    <FiList /> Unit Payload
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-[#0a2533] border border-[#00C2C7]/20 rounded-xl px-5 py-4 outline-none text-2xl font-black italic text-[#00C2C7] focus:border-[#00C2C7] transition-all"
                      value={questionsPerSet}
                      onChange={e => setQuestionsPerSet(parseInt(e.target.value) || 0)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#00C2C7]/40 uppercase tracking-widest">Q's / Set</div>
                  </div>
                </div>
              </div>

              {/* Submission Hub */}
              <button
                onClick={AddTest}
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-br from-[#00C2C7] to-[#0099a3] hover:shadow-[0_0_40px_rgba(0,194,199,0.5)] active:scale-[0.98] transition-all p-6 rounded-2xl flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                {loading ? (
                  <div className="w-6 h-6 border-4 border-[#061E29] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaMagic size={20} className="text-[#061E29]" />
                    <span className="text-[#061E29] font-black text-base uppercase italic tracking-tighter">
                      Create Re-Test
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar - Protocols & Intel */}
          <div className="space-y-8">
            {/* Operational Briefing */}
            <div className="bg-[#0a2533]/80 backdrop-blur-xl rounded-3xl p-6 border border-[#00C2C7]/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <FiActivity className="text-[#00C2C7] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Deployment Protocol</h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: '01', title: 'Data Extraction', desc: 'Analyzer parses PDF text stream' },
                  { step: '02', title: 'Randomization', desc: 'Shuffle questions per designated set' },
                  { step: '03', title: 'Distribution', desc: 'Assign mission to selected unit' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xl font-black font-mono text-[#00C2C7]/20 italic">{item.step}</span>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parsing Rules */}
            <div className="bg-[#0a2533]/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-[10px] font-black text-[#00C2C7] uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiFileText /> Parsing Matrix Rules
              </h3>

              <div className="space-y-3 bg-[#061E29]/50 rounded-xl p-4 border border-white/5 font-mono text-[9px] text-[#00C2C7]/80">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <span className="text-white">1. Protocol Question?</span><br />
                  <span className="ml-2 text-white/40">A. Option Alpha</span><br />
                  <span className="ml-2 text-white/40">B. Option Bravo</span><br />
                  <span className="font-bold">Answer: A</span>
                </div>
                <div className="text-[8px] italic leading-relaxed text-white/40">
                  * Sequence must be numerical<br />
                  * Options A-D required<br />
                  * "Answer:" header mandatory
                </div>
              </div>

              <button
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="w-full py-2 rounded-xl text-[9px] font-black uppercase text-[#00C2C7] border border-[#00C2C7]/30 hover:bg-[#00C2C7]/10 transition-all"
              >
                {showFormatGuide ? 'Collapse Matrix' : 'Expand Full Matrix'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Format Error Modal (Tactical Redesign) */}
      {showFormatModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#0a2533] max-w-2xl w-full rounded-[2.5rem] border border-red-500/30 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="bg-red-500/10 p-8 border-b border-red-500/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
                  <FiAlertCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Parsing Fault Detected</h2>
                  <p className="text-xs font-black text-red-400/60 uppercase tracking-widest mt-1 text-left">Internal Matrix Extraction Failed</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-[#061E29] rounded-2xl p-6 border border-white/5">
                <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Diagnostic Summary:</h3>
                <ul className="space-y-2 text-[10px] uppercase font-black tracking-tight text-white/60">
                  <li className="flex gap-3"><span className="text-red-500">[-]</span> Incorrect numbering sequence (Expected: 1. 2. 3.)</li>
                  <li className="flex gap-3"><span className="text-red-500">[-]</span> Corrupted option headers (Expected: A. B. C. D.)</li>
                  <li className="flex gap-3"><span className="text-red-500">[-]</span> Static image detection (Expected: Selectable Text)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFormatModal(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Close Diagnostic
                </button>
                <button
                  onClick={() => { setShowFormatModal(false); setShowFormatGuide(true); }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  View Calibration Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Corporate Watermark */}
      <div className="fixed bottom-6 right-8 opacity-25 pointer-events-none z-[9999] select-none text-right flex flex-col items-end">
        <img
          src="/edgeforce-logo.png"
          alt="Edgeforce"
          className="h-5 w-auto object-contain mb-1 brightness-150 contrast-125 grayscale"
        />
        <div className="text-[8px] font-black tracking-[0.3em] uppercase text-[#00C2C7] opacity-60">
          Edgeforce Solutions
        </div>
      </div>
    </div>
  );
};

export default GenerateTest;
