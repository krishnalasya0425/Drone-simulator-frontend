

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
} from "react-icons/fa";

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
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [noQuestions, setNoQuestions] = useState(10);
  const [questionType, setQuestionType] = useState([]);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [testId, setTestId] = useState("");
  const [retestStudentName, setRetestStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // State for Upload Mode
  const [numberOfSets, setNumberOfSets] = useState(1);
  const [setFiles, setSetFiles] = useState({}); // {0: File, 1: File}
  const [examConfig, setExamConfig] = useState({
    examType: "UNTIMED",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    passThreshold: 5
  });

  const handleSetFileChange = (index, file) => {
    setSetFiles(prev => ({
      ...prev,
      [index]: file
    }));
  };

  // Load classes for instructor (if no classId in URL)
  useEffect(() => {
    if (role === "Instructor" && !urlClassId) {
      loadClasses();
    }
    if (studentId) {
      // Fetch student name and set title
      loadStudentName(studentId);
    }
  }, []);

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

  // Load PDFs when class changes
  useEffect(() => {
    if (selectedClassId) {
      loadDocs(selectedClassId);
    }
  }, [selectedClassId]);

  const loadDocs = async (classId) => {
    try {
      const res = await classAPI.getDocs(classId);
      const pdfDocs = res.docs.filter((d) => d.file_type === "application/pdf");
      setDocs(pdfDocs);
    } catch (err) {
      console.error("Failed to load docs", err.message);
      setMessage("Failed to load documents");
      setMessageType("error");
    }
  };

  const toggleQuestionType = (type) => {
    setQuestionType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePdf = (pdfId) => {
    setSelectedPdfs((prev) =>
      prev.includes(pdfId) ? prev.filter((id) => id !== pdfId) : [...prev, pdfId]
    );
  };

  const AddTest = async () => {
    // Check access
    if (role === "Admin") {
      setMessage("⚠️ Access Denied: You are an Admin. Only Instructors can create tests.");
      setMessageType("error");
      return;
    }
    if (role !== "Instructor") {
      setMessage("⚠️ Access Denied: Only Instructors can generate tests.");
      setMessageType("error");
      return;
    }

    // Common Valdiation
    if (!title.trim()) {
      setMessage("❌ Test Name Required");
      setMessageType("error");
      return;
    }
    if (!selectedClassId) {
      setMessage("❌ Class Selection Required");
      setMessageType("error");
      return;
    }
    if (!userId) {
      setMessage("❌ Authentication Error");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("🔄 Processing... Please wait.");
      setMessageType("info");

      // Validate Files
      const filesCount = Object.keys(setFiles).length;
      if (filesCount < numberOfSets) {
        setMessage(`❌ Please upload a PDF file for all ${numberOfSets} sets.`);
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (examConfig.examType === 'TIMED' && !examConfig.durationMinutes) {
        setMessage("❌ Please specify duration for TIMED exam.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      // 1. Create Test Container
      const res = await test.addTest(title, userId, selectedClassId, studentId, requestId);
      const newTestId = res.testId;

      // 2. Upload Sets
      const formData = new FormData();
      formData.append('numberOfSets', numberOfSets);
      formData.append('questionsPerSet', 0); // Not used in this mode, calculated from PDF
      formData.append('examType', examConfig.examType);
      formData.append('passThreshold', examConfig.passThreshold);
      formData.append('classId', selectedClassId);

      if (examConfig.durationMinutes) formData.append('durationMinutes', examConfig.durationMinutes);
      if (examConfig.startTime) formData.append('startTime', examConfig.startTime);
      if (examConfig.endTime) formData.append('endTime', examConfig.endTime);

      // Append files in order
      for (let i = 0; i < numberOfSets; i++) {
        formData.append('pdfs', setFiles[i]);
      }

      await test.generateSetsFromPdf(newTestId, formData);

      setMessage("✅ Success! Test and Sets created successfully!");
      setMessageType("success");
      setTimeout(() => {
        navigate(`/${selectedClassId}/docs`);
      }, 2000);

    } catch (error) {
      console.error('Test creation error:', error);
      setMessage("❌ Failed: " + (error.response?.data?.message || error.message));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { value: "MCQ", label: "Multiple Choice Questions" },
    { value: "True/False", label: "True/False" },
  ];

  return (

    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(selectedClassId ? `/${selectedClassId}/docs` : '/classes')}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft size={18} />
            <span>Back to {selectedClassId ? 'Documents' : 'Classes'}</span>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FaMagic className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#074F06' }}>
                Generate Test
              </h1>
              {studentId && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                  <FaMagic size={12} />
                  Individual Retest for {retestStudentName || `Student #${studentId}`}
                </div>
              )}
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 mb-4 ${messageType === "success" ? "bg-green-100" :
                messageType === "error" ? "bg-red-100" :
                  "bg-blue-100"
                }`}
            >
              {messageType === "success" && <FaCheckCircle className="text-green-600" size={16} />}
              {messageType === "error" && <FaFileAlt className="text-red-600" size={16} />}
              {messageType === "info" && <FaListOl className="text-blue-600" size={16} />}
              <p
                className={`text-sm font-medium ${messageType === "success" ? "text-green-800" :
                  messageType === "error" ? "text-red-800" :
                    "text-blue-800"
                  }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Form Container */}
        <div
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: "rgba(159, 207, 159, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderColor: "rgba(7, 79, 6, 0.2)",
            boxShadow: "0 20px 60px rgba(7, 79, 6, 0.2)",
          }}
        >


          {/* Class Selection */}
          {role === "Instructor" && !urlClassId && (
            <div className="mb-5">
              <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
                <FaFileAlt size={14} />
                Select Class *
              </label>
              <select
                className="w-full p-3 border-2 rounded-lg outline-none transition-all bg-white"
                style={{ borderColor: '#074F06' }}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              >
                <option value="">-- Select Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Test Name */}
          <div className="mb-5">
            <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
              <FaFileAlt size={14} />
              Test Name *
            </label>
            <input
              type="text"
              className="w-full p-3 border-2 rounded-lg outline-none transition-all bg-white"
              style={{ borderColor: '#074F06' }}
              placeholder="e.g., Map Reading Set A-D"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* ========================================================= */}
          {/* UPLOAD MODE */}
          {/* ========================================================= */}
          <>
            {/* Number of Sets */}
            <div className="mb-5">
              <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
                <FaListOl size={14} />
                Number of Sets *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-3 border-2 rounded-lg outline-none bg-white font-bold text-lg"
                style={{ borderColor: '#074F06', width: '100px' }}
                value={numberOfSets}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0 && val <= 10) setNumberOfSets(val);
                }}
              />
            </div>

            {/* Dynamic File Inputs */}
            <div className="mb-5 space-y-3">
              <label className="font-semibold text-sm block" style={{ color: '#074F06' }}>
                Upload PDF for each Set *
              </label>
              {Array.from({ length: numberOfSets }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
                  <span className="font-bold text-green-800 w-16">Set {String.fromCharCode(65 + idx)}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    onChange={(e) => handleSetFileChange(idx, e.target.files[0])}
                  />
                </div>
              ))}
            </div>

            {/* Exam Configuration */}
            <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-sm mb-2 block" style={{ color: '#074F06' }}>To Pass (Questions)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={examConfig.passThreshold}
                  onChange={e => setExamConfig({ ...examConfig, passThreshold: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-semibold text-sm mb-2 block" style={{ color: '#074F06' }}>Exam Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={examConfig.examType}
                  onChange={e => setExamConfig({ ...examConfig, examType: e.target.value })}
                >
                  <option value="UNTIMED">Untimed</option>
                  <option value="TIMED">Timed (Duration)</option>
                </select>
              </div>
            </div>

            {examConfig.examType === 'TIMED' && (
              <div className="mb-5">
                <label className="font-semibold text-sm mb-2 block" style={{ color: '#074F06' }}>Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={examConfig.durationMinutes}
                  onChange={e => setExamConfig({ ...examConfig, durationMinutes: parseInt(e.target.value) })}
                />
              </div>
            )}



          </>


          {/* Create Test Button */}
          <button
            onClick={AddTest}
            disabled={loading}
            className="w-full py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#074F06' }}
            onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
            onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading & Creating Sets...
              </>
            ) : (
              <>
                <FaMagic size={16} />
                Create Test & Upload Sets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateTest;
