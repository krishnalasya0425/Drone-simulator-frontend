import React, { useState } from "react";
import { parseRawQuestions } from "../utils/parseQuestions";
import test from "../entities/test.jsx";
import {
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiCheck,
  FiX,
  FiAlertCircle
} from "react-icons/fi";
import { FaClipboardList } from "react-icons/fa";

export default function ParseQuestions() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      const cleaned = parseRawQuestions(rawJson);
      setQuestions(cleaned);
      // Select all by default
      setSelected(cleaned.map(q => q.id));
    } catch (err) {
      console.error("Error parsing: ", err);
      alert("Invalid JSON file! Please check the format.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(questions.map(q => q.id));
  };

  const deselectAll = () => {
    setSelected([]);
  };

  const handleSubmit = async () => {
    try {
      if (selected.length === 0) {
        alert("Please select at least one question!");
        return;
      }

      const selectedQuestions = questions.filter(q => selected.includes(q.id));
      const payload = buildPayload(selectedQuestions);

      const data = await test.addQuestions(1, payload);

      alert(`✅ ${selected.length} question(s) inserted successfully!`);
      console.log("Inserted:", data);

      // Reset after successful submission
      setQuestions([]);
      setSelected([]);
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting questions!");
    }
  };

  function buildPayload(questions) {
    console.log("Building payload for questions:", questions);
    return questions.map(q => ({
      question_text: q.text,
      type: q.type,
      answer: q.answer,
      options: q.options?.map((opt, idx) => ({
        label: String.fromCharCode(65 + idx), // A/B/C/D
        text: opt
      }))
    }));
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f0fdf4' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FaClipboardList className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#074F06' }}>
                Question Parser
              </h1>
              <p className="text-gray-600">
                Upload and parse JSON questions for your tests
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FiUpload size={24} style={{ color: '#074F06' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#074F06' }}>
              Upload Questions File
            </h2>
          </div>

          <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all"
            style={{ borderColor: '#074F06' }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.backgroundColor = '#D5F2D5';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: '#D5F2D5' }}>
                <FiFileText size={32} style={{ color: '#074F06' }} />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drop your JSON file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Accepts .json files only
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: '#074F06' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
            >
              <FiUpload size={20} />
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <>
            {/* Selection Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#074F06' }}>
                    Parsed Questions
                  </h2>
                  <p className="text-gray-600">
                    {selected.length} of {questions.length} questions selected
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-medium transition-all border-2"
                    style={{ color: '#074F06', borderColor: '#074F06' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#D5F2D5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <FiCheck size={18} />
                    Select All
                  </button>

                  <button
                    onClick={deselectAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg font-medium transition-all border-2 border-gray-300 hover:bg-gray-50"
                  >
                    <FiX size={18} />
                    Deselect All
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={selected.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ backgroundColor: '#074F06' }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) e.target.style.backgroundColor = '#053d05';
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.disabled) e.target.style.backgroundColor = '#074F06';
                    }}
                  >
                    <FiCheckCircle size={20} />
                    Submit {selected.length > 0 && `(${selected.length})`}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(selected.length / questions.length) * 100}%`,
                      backgroundColor: '#074F06'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isSelected = selected.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`group bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden border-2 cursor-pointer ${isSelected ? 'border-green-500' : 'border-gray-200'
                      }`}
                    onClick={() => toggleSelection(q.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#074F06';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div className="p-6">
                      {/* Question Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 group-hover:border-green-400'
                            }`}>
                            {isSelected && <FiCheck className="text-white" size={16} />}
                          </div>
                        </div>

                        {/* Question Number Badge */}
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ backgroundColor: '#074F06' }}>
                          {idx + 1}
                        </div>

                        {/* Question Text */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {q.text}
                          </h3>

                          {/* Type Badge */}
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${q.type === 'mcq'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                            }`}>
                            {q.type === 'mcq' ? 'Multiple Choice' : 'True/False'}
                          </span>
                        </div>
                      </div>

                      {/* Options */}
                      {q.type !== "tf" && q.options && (
                        <div className="ml-20 mb-4 space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isCorrect = q.answer === letter;

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-lg border-2 ${isCorrect
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-200'
                                  }`}
                              >
                                <span className="font-semibold mr-2">{letter}.</span>
                                {opt}
                                {isCorrect && (
                                  <FiCheckCircle className="inline ml-2 text-green-600" size={16} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* True/False Options */}
                      {q.type === "tf" && (
                        <div className="ml-20 mb-4 space-y-2">
                          {['True', 'False'].map((option) => {
                            const isCorrect = q.answer === option;

                            return (
                              <div
                                key={option}
                                className={`p-3 rounded-lg border-2 ${isCorrect
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-200'
                                  }`}
                              >
                                <span className="font-semibold">{option}</span>
                                {isCorrect && (
                                  <FiCheckCircle className="inline ml-2 text-green-600" size={16} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answer */}
                      <div className="ml-20 flex items-center gap-2 text-green-700 font-semibold">
                        <FiCheckCircle size={18} />
                        <span>Correct Answer: {q.answer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Submit Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={selected.length === 0}
                className="flex items-center gap-2 px-8 py-4 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) e.target.style.backgroundColor = '#053d05';
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) e.target.style.backgroundColor = '#074F06';
                }}
              >
                <FiCheckCircle size={24} />
                Submit {selected.length} Selected Question{selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {questions.length === 0 && !uploading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#D5F2D5' }}>
              <FiAlertCircle size={40} style={{ color: '#074F06' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Questions Loaded
            </h3>
            <p className="text-gray-500">
              Upload a JSON file to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
