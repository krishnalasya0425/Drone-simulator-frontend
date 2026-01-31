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
  const [numberOfSets, setNumberOfSets] = useState(studentId ? 1 : 3); // 1 set for retest, 3 for regular
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

  const handleQuestionBankChange = (file) => {
    setQuestionBankFile(file);
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

    // Validation
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
    if (!questionBankFile) {
      setMessage("❌ Please upload a Question Bank PDF file");
      setMessageType("error");
      return;
    }
    if (numberOfSets < 1 || questionsPerSet < 1) {
      setMessage("❌ Number of sets and questions per set must be at least 1");
      setMessageType("error");
      return;
    }
    if (examConfig.examType === 'TIMED' && !examConfig.durationMinutes) {
      setMessage("❌ Please specify duration for TIMED exam");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("🔄 Processing... Please wait.");
      setMessageType("info");

      // 1. Create Test Container
      const res = await test.addTest(title, userId, selectedClassId, studentId, requestId);
      const newTestId = res.testId;

      // 2. Upload Question Bank and Generate Sets
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

      setMessage(`✅ Success! Created ${result.numberOfSets} sets with ${result.questionsPerSet} questions each from a bank of ${result.totalQuestions} questions!`);
      setMessageType("success");
      setTimeout(() => {
        navigate(`/${selectedClassId}/docs`);
      }, 2000);

    } catch (error) {
      console.error('Test creation error:', error);
      const errorMsg = error.message || "Unknown error";

      if (errorMsg.includes("No questions found") ||
        errorMsg.includes("Failed to parse PDF") ||
        errorMsg.includes("corrupted") ||
        errorMsg.includes("Failed to extract text")) {
        setShowFormatModal(true);
      } else {
        setMessage("❌ Failed: " + errorMsg);
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f0fdf4' }}>
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
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FaRandom className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#074F06' }}>
                {studentId ? 'Generate Retest' : 'Generate Test'}
              </h1>
              <p className="text-gray-600">
                Upload one PDF with all questions. We'll randomly distribute them across multiple test sets.
              </p>
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

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <FiLayers className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">How It Works</h2>
              <p className="text-sm text-blue-800 mt-1">Simple 3-step process to create randomized test sets</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-blue-900">Upload Question Bank</h3>
              </div>
              <p className="text-sm text-gray-700">One PDF with all your questions (e.g., 50 questions)</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-blue-900">Configure Sets</h3>
              </div>
              <p className="text-sm text-gray-700">Specify how many sets and questions per set (e.g., 5 sets × 10 questions)</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-blue-900">Random Distribution</h3>
              </div>
              <p className="text-sm text-gray-700">Questions randomly distributed to sets, sets randomly assigned to students</p>
            </div>
          </div>
        </div>

        {/* PDF Format Guide */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 mb-6 border-2" style={{ borderColor: '#D5F2D5' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                <FiFileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#074F06' }}>PDF Format Requirements</h2>
                <p className="text-sm text-gray-700">Your PDF must follow this exact format for questions to be parsed correctly</p>
              </div>
            </div>
            <button
              onClick={() => setShowFormatGuide(!showFormatGuide)}
              className="px-4 py-2 text-white rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#074F06' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
            >
              {showFormatGuide ? 'Hide' : 'Show'} Example
            </button>
          </div>

          {showFormatGuide && (
            <div className="mt-4 bg-white rounded-lg p-6 border-2" style={{ borderColor: '#D5F2D5' }}>
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#074F06' }}>
                <FiCheck style={{ color: '#074F06' }} />
                Correct Format Example:
              </h3>
              <div className="p-4 rounded-lg font-mono text-sm space-y-3 border-2 border-gray-300" style={{ backgroundColor: '#f0fdf4' }}>
                <div>
                  <span className="font-bold" style={{ color: '#074F06' }}>1.</span> <span className="text-gray-800">What is the capital of France?</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div><span className="font-bold" style={{ color: '#16a34a' }}>A.</span> <span className="text-gray-700">London</span></div>
                  <div><span className="font-bold" style={{ color: '#16a34a' }}>B.</span> <span className="text-gray-700">Paris</span></div>
                  <div><span className="font-bold" style={{ color: '#16a34a' }}>C.</span> <span className="text-gray-700">Berlin</span></div>
                  <div><span className="font-bold" style={{ color: '#16a34a' }}>D.</span> <span className="text-gray-700">Madrid</span></div>
                </div>
                <div className="ml-4">
                  <span className="font-bold" style={{ color: '#15803d' }}>Answer:</span> <span className="text-gray-800">B</span>
                </div>

                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <span className="font-bold" style={{ color: '#074F06' }}>2.</span> <span className="text-gray-800">The Earth is flat.</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div><span className="font-bold" style={{ color: '#16a34a' }}>A.</span> <span className="text-gray-700">True</span></div>
                  <div><span className="text-blue-600 font-bold">B.</span> <span className="text-gray-700">False</span></div>
                </div>
                <div className="ml-4">
                  <span className="font-bold" style={{ color: '#15803d' }}>Answer:</span> <span className="text-gray-800">False</span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg border-2" style={{ backgroundColor: '#D5F2D5', borderColor: '#074F06' }}>
                <h4 className="font-bold mb-2" style={{ color: '#074F06' }}>📋 Important Rules:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#074F06' }}>
                  <li>Start each question with a number followed by a period (1., 2., 3...)</li>
                  <li>Options must start with A., B., C., or D. (with period)</li>
                  <li>Each answer must be on a new line starting with "Answer:" followed by the letter or True/False</li>
                  <li>Leave blank lines between questions for better readability</li>
                  <li>PDF must contain selectable text (not scanned images)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">

          {/* Class Selection */}
          {role === "Instructor" && !urlClassId && (
            <div>
              <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
                <FiList />
                Select Class *
              </label>
              <select
                className="w-full p-3 border-2 rounded-lg outline-none transition-all bg-white focus:border-green-600"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
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
          <div>
            <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
              <FiFileText />
              Test Name *
            </label>
            <input
              type="text"
              className="w-full p-3 border-2 rounded-lg outline-none transition-all focus:border-green-600"
              placeholder="e.g., Map Reading Mid-Term"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Question Bank Upload */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
            <label className="flex items-center gap-2 font-semibold text-lg mb-3 text-purple-900">
              <FaFilePdf size={24} /> Upload Question Bank PDF *
            </label>
            <p className="text-sm text-purple-800 mb-4">
              Upload a single PDF containing all your questions. The system will randomly select questions for each set.
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
              <input
                type="file"
                accept=".pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                onChange={(e) => handleQuestionBankChange(e.target.files[0])}
              />
              {questionBankFile && (
                <div className="mt-3 flex items-center gap-2 text-green-700">
                  <FiCheck size={20} />
                  <span className="font-semibold">{questionBankFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Set Configuration */}
          <div className={`grid grid-cols-1 ${!studentId ? 'md:grid-cols-2' : ''} gap-6`}>
            {/* Only show Number of Sets for regular tests, not retests */}
            {!studentId && (
              <div>
                <label className="flex items-center gap-2 font-semibold text-sm mb-3" style={{ color: '#074F06' }}>
                  <FaLayerGroup /> Number of Sets *
                </label>
                <input
                  type="number"
                  min="1"
                  max="26"
                  className="w-full p-3 border-2 rounded-lg font-bold text-lg focus:border-green-600"
                  value={numberOfSets}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val > 0 && val <= 26) setNumberOfSets(val);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">How many different test variations to create (Set A, B, C...)</p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 font-semibold text-sm mb-3" style={{ color: '#074F06' }}>
                <FiList /> Questions Per Set *
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border-2 rounded-lg font-bold text-lg focus:border-green-600"
                value={questionsPerSet}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (val > 0) setQuestionsPerSet(val);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">How many questions each student will receive</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiActivity className="text-blue-600 mt-1" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">📊 Configuration Summary:</p>
                <ul className="space-y-1">
                  {studentId ? (
                    <>
                      <li>• Creating <span className="font-bold">1 test set</span> for individual student</li>
                      <li>• The set will have <span className="font-bold">{questionsPerSet} questions</span></li>
                      <li>• Questions will be <span className="font-bold">randomly selected</span> from your question bank</li>
                      <li>• Test will be assigned to <span className="font-bold">{retestStudentName || 'the student'}</span></li>
                    </>
                  ) : (
                    <>
                      <li>• You will create <span className="font-bold">{numberOfSets} different test sets</span></li>
                      <li>• Each set will have <span className="font-bold">{questionsPerSet} questions</span></li>
                      <li>• Questions will be <span className="font-bold">randomly selected</span> from your question bank</li>
                      <li>• Sets will be <span className="font-bold">randomly assigned</span> to students</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Exam Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
                Exam Type
              </label>
              <select
                className="w-full p-3 border-2 rounded-lg bg-white focus:border-green-600"
                value={examConfig.examType}
                onChange={e => setExamConfig({ ...examConfig, examType: e.target.value })}
              >
                <option value="UNTIMED">Untimed (Practice)</option>
                <option value="TIMED">Timed (Duration)</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
                <FiCheck /> Pass Threshold (Questions)
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border-2 rounded-lg focus:border-green-600"
                value={examConfig.passThreshold}
                onChange={e => {
                  const val = parseInt(e.target.value) || 1;
                  setExamConfig({ ...examConfig, passThreshold: val >= 1 ? val : 1 });
                }}
              />
            </div>
          </div>

          {/* Conditional Timed Config */}
          {examConfig.examType === 'TIMED' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
              <FiClock className="text-blue-600" size={24} />
              <div className="flex-1">
                <label className="font-semibold text-sm text-blue-800 block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded focus:border-blue-500"
                  value={examConfig.durationMinutes}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    setExamConfig({ ...examConfig, durationMinutes: val >= 1 ? val : 1 });
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={AddTest}
            disabled={loading}
            className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#074F06' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Test Sets from Question Bank...
              </>
            ) : (
              <>
                <FiUpload size={24} />
                {studentId ? 'Create Retest Sets' : 'Create Test Sets from Question Bank'}
              </>
            )}
          </button>
        </div>

        {/* Format Error Modal */}
        {showFormatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #074F06, #16a34a)' }}>
                <div className="flex items-center gap-3 text-white">
                  <FiActivity size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">Invalid PDF Format</h2>
                    <p className="text-green-100">Your PDF doesn't match the required format</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <FiActivity className="text-red-600" />
                    What went wrong?
                  </h3>
                  <p className="text-red-800 text-sm">
                    We couldn't find any valid questions in your PDF. This usually means:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-red-800 space-y-1">
                    <li>The PDF format doesn't match our requirements</li>
                    <li>The PDF is a scanned image (text must be selectable)</li>
                    <li>Questions are not numbered correctly (must use 1., 2., 3...)</li>
                    <li>Options don't start with A., B., C., D.</li>
                    <li>Answer lines are missing or incorrectly formatted</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <FiCheck className="text-green-600" />
                    Required Format:
                  </h3>
                  <div className="bg-white p-4 rounded-lg font-mono text-sm space-y-2 border border-green-300">
                    <div><span className="text-green-600 font-bold">1.</span> <span className="text-gray-800">Your question text here?</span></div>
                    <div className="ml-4"><span className="text-blue-600 font-bold">A.</span> <span className="text-gray-700">First option</span></div>
                    <div className="ml-4"><span className="text-blue-600 font-bold">B.</span> <span className="text-gray-700">Second option</span></div>
                    <div className="ml-4"><span className="text-blue-600 font-bold">C.</span> <span className="text-gray-700">Third option</span></div>
                    <div className="ml-4"><span className="text-blue-600 font-bold">D.</span> <span className="text-gray-700">Fourth option</span></div>
                    <div className="ml-4"><span className="text-purple-600 font-bold">Answer:</span> <span className="text-gray-800">A</span></div>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">💡 Quick Tips:</h3>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li>Use a period (.) after question numbers and option letters</li>
                    <li>Make sure text is selectable (not a scanned image)</li>
                    <li>Each answer must be on its own line</li>
                    <li>Leave blank lines between questions</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowFormatModal(false);
                      setShowFormatGuide(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#074F06' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
                  >
                    <FiFileText />
                    View Full Format Guide
                  </button>
                  <button
                    onClick={() => setShowFormatModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTest;
