import React, { useState, useEffect } from "react";
import test from "../entities/test.jsx";
import { classAPI } from "../entities/class";
import { useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiList,
  FiClock,
  FiActivity,
  FiLayers
} from "react-icons/fi";
import { FaClipboardList, FaFilePdf, FaLayerGroup, FaRandom } from "react-icons/fa";

export default function TestMaker() {
  const navigate = useNavigate();

  // User Info
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  // State
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [title, setTitle] = useState("");
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [questionsPerSet, setQuestionsPerSet] = useState(10);
  const [questionBankFile, setQuestionBankFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [examConfig, setExamConfig] = useState({
    examType: "UNTIMED",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    passThreshold: 5
  });
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // Load Classes
  useEffect(() => {
    if (role === "Instructor" || role === "admin") {
      loadClasses();
    }
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classAPI.getAllClasses(userId);
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  };

  const handleQuestionBankChange = (file) => {
    setQuestionBankFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedClassId) {
      alert("Please provide Test Name and Select a Class.");
      return;
    }

    if (!questionBankFile) {
      alert("Please upload a Question Bank PDF file.");
      return;
    }

    if (examConfig.examType === 'TIMED' && !examConfig.durationMinutes) {
      alert("Please specify duration for TIMED exam.");
      return;
    }

    if (numberOfSets < 1 || questionsPerSet < 1) {
      alert("Number of sets and questions per set must be at least 1.");
      return;
    }

    setUploading(true);
    try {
      // 1. Create Test Container
      const res = await test.addTest(title, userId, selectedClassId);
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

      alert(`✅ Success! Created ${result.numberOfSets} sets with ${result.questionsPerSet} questions each from a bank of ${result.totalQuestions} questions!`);
      navigate(`/${selectedClassId}/docs`);

    } catch (error) {
      console.error("Error creating test sets from question bank:", error);

      const errorMsg = error.message || "Unknown error";
      if (errorMsg.includes("No questions found") ||
        errorMsg.includes("Failed to parse PDF") ||
        errorMsg.includes("corrupted") ||
        errorMsg.includes("Failed to extract text")) {
        setShowFormatModal(true);
      } else {
        alert("Failed to create test sets: " + errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#061E29' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                <FaRandom className="text-white" size={32} />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
                Test Maker - Question Bank
              </h1>
              <p className="text-cyan-100/70 text-sm">
                Upload one PDF with all questions. We'll randomly distribute them across multiple test sets.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="relative rounded-xl p-6 mb-6 border border-cyan-500/30 overflow-hidden"
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.15)'
          }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <FiLayers className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-400">How It Works</h2>
                <p className="text-sm text-cyan-100/60 mt-1">Simple 3-step process to create randomized test sets</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg p-4 border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/50">1</div>
                  <h3 className="font-bold text-cyan-300">Upload Question Bank</h3>
                </div>
                <p className="text-sm text-cyan-100/70">One PDF with all your questions (e.g., 50 questions)</p>
              </div>
              <div className="rounded-lg p-4 border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/50">2</div>
                  <h3 className="font-bold text-cyan-300">Configure Sets</h3>
                </div>
                <p className="text-sm text-cyan-100/70">Specify how many sets and questions per set (e.g., 5 sets × 10 questions)</p>
              </div>
              <div className="rounded-lg p-4 border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/50">3</div>
                  <h3 className="font-bold text-cyan-300">Random Distribution</h3>
                </div>
                <p className="text-sm text-cyan-100/70">Questions randomly distributed to sets, sets randomly assigned to students</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Format Guide */}
        <div className="relative rounded-xl p-6 mb-6 border border-cyan-500/30 overflow-hidden"
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <FiFileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cyan-400">PDF Format Requirements</h2>
                  <p className="text-sm text-cyan-100/60">Your PDF must follow this exact format for questions to be parsed correctly</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="px-4 py-2 rounded-lg font-semibold transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {showFormatGuide ? 'Hide' : 'Show'} Example
              </button>
            </div>

            {showFormatGuide && (
              <div className="mt-4 rounded-lg p-6 border border-cyan-500/30" style={{ backgroundColor: 'rgba(6, 30, 41, 0.5)' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-cyan-300">
                  <FiCheckCircle className="text-cyan-400" />
                  Correct Format Example:
                </h3>
                <div className="p-4 rounded-lg font-mono text-sm space-y-3 border border-cyan-500/30" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <div>
                    <span className="font-bold text-cyan-400">1.</span> <span className="text-cyan-100">What is the capital of France?</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div><span className="font-bold text-blue-400">A.</span> <span className="text-cyan-100/70">London</span></div>
                    <div><span className="font-bold text-blue-400">B.</span> <span className="text-cyan-100/70">Paris</span></div>
                    <div><span className="font-bold text-blue-400">C.</span> <span className="text-cyan-100/70">Berlin</span></div>
                    <div><span className="font-bold text-blue-400">D.</span> <span className="text-cyan-100/70">Madrid</span></div>
                  </div>
                  <div className="ml-4">
                    <span className="font-bold text-green-400">Answer:</span> <span className="text-cyan-100">B</span>
                  </div>

                  <div className="border-t border-cyan-500/30 pt-3 mt-3">
                    <span className="font-bold text-cyan-400">2.</span> <span className="text-cyan-100">The Earth is flat.</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div><span className="font-bold text-blue-400">A.</span> <span className="text-cyan-100/70">True</span></div>
                    <div><span className="font-bold text-blue-400">B.</span> <span className="text-cyan-100/70">False</span></div>
                  </div>
                  <div className="ml-4">
                    <span className="font-bold text-green-400">Answer:</span> <span className="text-cyan-100">False</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg border border-cyan-500/50" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <h4 className="font-bold mb-2 text-cyan-300">📋 Important Rules:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-cyan-100/70">
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
        </div>

        {/* Access Check */}
        {role !== "Instructor" && role !== "admin" ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg">
            Access Denied. Only Instructors can create tests.
          </div>
        ) : (

          <div className="relative rounded-xl p-8 space-y-6 border border-cyan-500/30 overflow-hidden"
            style={{
              backgroundColor: 'rgba(6, 30, 41, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
            <div className="relative z-10 space-y-6">

              {/* 1. Test Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-2 text-cyan-300">
                    <FiFileText /> Test Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-cyan-500/30 rounded-lg outline-none transition-all bg-cyan-900/20 text-cyan-100 placeholder-cyan-100/40 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
                    placeholder="e.g. Map Reading Mid-Term"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-2 text-cyan-300">
                    <FiList /> Select Class *
                  </label>
                  <select
                    className="w-full p-3 border border-cyan-500/30 rounded-lg outline-none transition-all bg-cyan-900/20 text-cyan-100 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.class_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="border-cyan-500/20" />

              {/* 2. Question Bank Upload */}
              <div className="rounded-xl p-6 border border-purple-500/30" style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                <label className="flex items-center gap-2 font-semibold text-lg mb-3 text-purple-300">
                  <FaFilePdf size={24} /> Upload Question Bank PDF *
                </label>
                <p className="text-sm text-purple-200/60 mb-4">
                  Upload a single PDF containing all your questions. The system will randomly select questions for each set.
                </p>
                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                  <input
                    type="file"
                    accept=".pdf"
                    className="block w-full text-sm text-cyan-100/70 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:shadow-lg hover:file:shadow-purple-500/50 cursor-pointer"
                    onChange={(e) => handleQuestionBankChange(e.target.files[0])}
                  />
                  {questionBankFile && (
                    <div className="mt-3 flex items-center gap-2 text-green-400">
                      <FiCheckCircle size={20} />
                      <span className="font-semibold">{questionBankFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-cyan-500/20" />

              {/* 3. Set Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-3 text-cyan-300">
                    <FaLayerGroup /> Number of Sets *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="26"
                    className="w-full p-3 border border-cyan-500/30 rounded-lg font-bold text-lg bg-cyan-900/20 text-cyan-100 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 outline-none"
                    value={numberOfSets}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= 26) setNumberOfSets(val);
                    }}
                  />
                  <p className="text-xs text-cyan-100/50 mt-1">How many different test variations to create (Set A, B, C...)</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-3 text-cyan-300">
                    <FiList /> Questions Per Set *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-cyan-500/30 rounded-lg font-bold text-lg bg-cyan-900/20 text-cyan-100 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 outline-none"
                    value={questionsPerSet}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (val > 0) setQuestionsPerSet(val);
                    }}
                  />
                  <p className="text-xs text-cyan-100/50 mt-1">How many questions each student will receive</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-lg p-4 border border-blue-500/30" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                <div className="flex items-start gap-3">
                  <FiActivity className="text-blue-400 mt-1" size={20} />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">📊 Configuration Summary:</p>
                    <ul className="space-y-1 text-cyan-100/70">
                      <li>• You will create <span className="font-bold text-cyan-300">{numberOfSets} different test sets</span></li>
                      <li>• Each set will have <span className="font-bold text-cyan-300">{questionsPerSet} questions</span></li>
                      <li>• Questions will be <span className="font-bold text-cyan-300">randomly selected</span> from your question bank</li>
                      <li>• Sets will be <span className="font-bold text-cyan-300">randomly assigned</span> to students</li>
                    </ul>
                  </div>
                </div>
              </div>

              <hr className="border-cyan-500/20" />

              {/* 4. Exam Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-2 text-cyan-300">
                    Exam Type
                  </label>
                  <select
                    className="w-full p-3 border border-cyan-500/30 rounded-lg bg-cyan-900/20 text-cyan-100 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 outline-none"
                    value={examConfig.examType}
                    onChange={e => setExamConfig({ ...examConfig, examType: e.target.value })}
                  >
                    <option value="UNTIMED">Untimed (Practice)</option>
                    <option value="TIMED">Timed (Duration)</option>

                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 font-semibold text-sm mb-2 text-cyan-300">
                    <FiCheckCircle /> Pass Threshold (Questions)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-cyan-500/30 rounded-lg bg-cyan-900/20 text-cyan-100 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 outline-none"
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
                <div className="rounded-lg p-4 border border-blue-500/30 flex items-center gap-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                  <FiClock className="text-blue-400" size={24} />
                  <div className="flex-1">
                    <label className="font-semibold text-sm text-blue-300 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border border-blue-500/30 rounded bg-blue-900/20 text-cyan-100 focus:border-blue-400 outline-none"
                      value={examConfig.durationMinutes}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 1;
                        setExamConfig({ ...examConfig, durationMinutes: val >= 1 ? val : 1 });
                      }}
                    />
                  </div>
                </div>
              )}

              {examConfig.examType === 'FIXED_TIME' && (
                <div className="rounded-lg p-4 border border-purple-500/30 grid grid-cols-2 gap-4" style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                  <div>
                    <label className="font-semibold text-sm text-purple-300 block mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border border-purple-500/30 rounded bg-purple-900/20 text-cyan-100 focus:border-purple-400 outline-none"
                      value={examConfig.startTime}
                      onChange={e => setExamConfig({ ...examConfig, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-sm text-purple-300 block mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border border-purple-500/30 rounded bg-purple-900/20 text-cyan-100 focus:border-purple-400 outline-none"
                      value={examConfig.endTime}
                      onChange={e => setExamConfig({ ...examConfig, endTime: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/50"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Test Sets from Question Bank...
                  </>
                ) : (
                  <>
                    <FiUpload size={24} />
                    Create Test Sets from Question Bank
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* Format Error Modal */}
        {showFormatModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30" style={{ backgroundColor: '#061E29' }}>
              <div className="p-6 rounded-t-2xl bg-gradient-to-r from-red-600 to-orange-600">
                <div className="flex items-center gap-3 text-white">
                  <FiActivity size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">Invalid PDF Format</h2>
                    <p className="text-red-100">Your PDF doesn't match the required format</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                    <FiActivity className="text-red-400" />
                    What went wrong?
                  </h3>
                  <p className="text-red-200/80 text-sm">
                    We couldn't find any valid questions in your PDF. This usually means:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-red-200/70 space-y-1">
                    <li>The PDF format doesn't match our requirements</li>
                    <li>The PDF is a scanned image (text must be selectable)</li>
                    <li>Questions are not numbered correctly (must use 1., 2., 3...)</li>
                    <li>Options don't start with A., B., C., D.</li>
                    <li>Answer lines are missing or incorrectly formatted</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-green-400" />
                    Required Format:
                  </h3>
                  <div className="bg-cyan-900/20 p-4 rounded-lg font-mono text-sm space-y-2 border border-cyan-500/30">
                    <div><span className="text-green-400 font-bold">1.</span> <span className="text-cyan-100">Your question text here?</span></div>
                    <div className="ml-4"><span className="text-blue-400 font-bold">A.</span> <span className="text-cyan-100/70">First option</span></div>
                    <div className="ml-4"><span className="text-blue-400 font-bold">B.</span> <span className="text-cyan-100/70">Second option</span></div>
                    <div className="ml-4"><span className="text-blue-400 font-bold">C.</span> <span className="text-cyan-100/70">Third option</span></div>
                    <div className="ml-4"><span className="text-blue-400 font-bold">D.</span> <span className="text-cyan-100/70">Fourth option</span></div>
                    <div className="ml-4"><span className="text-purple-400 font-bold">Answer:</span> <span className="text-cyan-100">A</span></div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-300 mb-2">💡 Quick Tips:</h3>
                  <ul className="list-disc list-inside text-sm text-blue-200/70 space-y-1">
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
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                  >
                    <FiFileText />
                    View Full Format Guide
                  </button>
                  <button
                    onClick={() => setShowFormatModal(false)}
                    className="px-6 py-3 bg-cyan-900/30 border border-cyan-500/30 text-cyan-100 rounded-lg font-semibold hover:bg-cyan-900/50 transition-all"
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
}
