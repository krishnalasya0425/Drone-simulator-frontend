

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classAPI } from "../entities/class";
import test from "../entities/test";
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

  // Get user info from localStorage
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  // State management
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(urlClassId || "");
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [noQuestions, setNoQuestions] = useState(10);
  const [questionType, setQuestionType] = useState([]);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [testId, setTestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load classes for instructor (if no classId in URL)
  useEffect(() => {
    if (role === "Instructor" && !urlClassId) {
      loadClasses();
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
    if (!title.trim()) {
      setMessage("Please enter a test name");
      setMessageType("error");
      return;
    }

    if (!selectedClassId) {
      setMessage("Please select a class");
      setMessageType("error");
      return;
    }

    if (!userId) {
      setMessage("User ID not found. Please log in again.");
      setMessageType("error");
      return;
    }

    if (questionType.length === 0) {
      setMessage("Please select at least one question type");
      setMessageType("error");
      return;
    }

    if (selectedPdfs.length === 0) {
      setMessage("Please select at least one PDF source");
      setMessageType("error");
      return;
    }

    if (noQuestions === 0) {
      setMessage("Please set number of questions greater than 0");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("Generating your test...");
      setMessageType("info");

      // Debug logging
      console.log('Test creation parameters:', {
        title,
        userId,
        selectedClassId,
        questionType,
        noQuestions,
        selectedPdfs
      });

      // Call API with userId and classId
      const res = await test.addTest(title, userId, selectedClassId);

      console.log('Test creation response:', res);

      // Store the test ID for future use
      if (res.testId) {
        setTestId(res.testId);
      }

      setMessage("Test created successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate(`/${selectedClassId}/docs`);
      }, 1500);
    } catch (error) {
      console.error('Test creation error:', error);
      setMessage(`Failed to create test: ${error.message || 'Unknown error'}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { value: "MCQ", label: "Multiple Choice Questions" },
    { value: "True/False", label: "True/False" },
    { value: "Fill in the Blanks", label: "Fill in the Blanks" },
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
              <p className="text-sm text-gray-600">
                Create AI-powered tests from your PDF documents
              </p>
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
          {/* Class Selection (only if no classId in URL) */}
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
              placeholder="e.g., Map Reading Fundamentals Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* Number of Questions */}
          <div className="mb-5">
            <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: '#074F06' }}>
              <FaListOl size={14} />
              Number of Questions: <span className="text-lg ml-1 font-bold">{noQuestions}</span>
            </label>
            <div className="bg-white p-4 rounded-lg">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #074F06 0%, #074F06 ${(noQuestions / 50) * 100}%, #e5e7eb ${(noQuestions / 50) * 100}%, #e5e7eb 100%)`
                }}
                value={noQuestions}
                onChange={(e) => setNoQuestions(e.target.value)}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="mb-5">
            <label className="font-semibold text-sm mb-2 block" style={{ color: '#074F06' }}>
              Question Types *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {questionTypes.map((type) => (
                <label
                  key={type.value}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${questionType.includes(type.value)
                    ? "border-green-600 bg-white shadow-lg"
                    : "border-gray-300 bg-white hover:border-green-400"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={questionType.includes(type.value)}
                      onChange={() => toggleQuestionType(type.value)}
                      className="w-5 h-5 accent-green-600"
                    />
                    <div className="text-sm font-semibold text-gray-800">{type.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Select PDF Source */}
          <div className="mb-5">
            <label className="font-semibold text-sm mb-2 block" style={{ color: '#074F06' }}>
              Select Source PDFs *
            </label>

            {docs.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg">
                <FaFilePdf className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-500 font-medium">No PDFs uploaded for this class.</p>
                <p className="text-xs text-gray-400 mt-1">Upload PDF documents to generate tests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs.map((pdf) => (
                  <label
                    key={pdf.id}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${selectedPdfs.includes(pdf.id)
                      ? "border-green-600 bg-white shadow-lg"
                      : "border-gray-300 bg-white hover:border-green-400"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPdfs.includes(pdf.id)}
                        onChange={() => togglePdf(pdf.id)}
                        className="w-5 h-5 accent-green-600"
                      />
                      <FaFilePdf size={24} className="text-red-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate">{pdf.doc_title}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

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
                Generating Test...
              </>
            ) : (
              <>
                <FaMagic size={16} />
                Generate Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateTest;
