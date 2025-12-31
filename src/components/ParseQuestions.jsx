import React, { useState } from "react";
import { parseRawQuestions } from "../utils/parseQuestions";
import test from "../entities/test.jsx";
import { FiUpload, FiCheckCircle, FiXCircle, FiFileText, FiCheck } from "react-icons/fi";

export default function ParseQuestions() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      const cleaned = parseRawQuestions(rawJson);
      setQuestions(cleaned);
      // Auto-select all questions
      setSelected(cleaned.map(q => q.id));
    } catch (err) {
      console.error("Error parsing: ", err);
      alert("Invalid JSON file! Please check the format.");
    }
  };

  const toggleSelection = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === questions.length) {
      setSelected([]);
    } else {
      setSelected(questions.map(q => q.id));
    }
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

      alert(`✅ ${selected.length} questions inserted successfully!`);
      console.log("Inserted:", data);

      // Reset after successful submission
      setQuestions([]);
      setSelected([]);

    } catch (err) {
      console.error(err);
      alert("❌ An error occurred while submitting questions!");
    }
  };

  function buildPayload(questions) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FiFileText className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#074F06' }}>Test Maker</h1>
          </div>
          <p className="text-gray-600 text-sm ml-14">Upload and manage test questions from JSON</p>
        </div>

        {/* ================= FILE UPLOAD ================= */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <label className="block mb-2 text-sm font-bold text-gray-800">
            Upload Questions JSON File
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:shadow-lg transition-all"
              style={{
                fileBackgroundColor: '#074F06',
              }}
              id="file-upload"
            />
            <style>{`
              #file-upload::file-selector-button {
                background-color: #074F06;
                transition: all 0.3s;
              }
              #file-upload::file-selector-button:hover {
                background-color: #053d05;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
            `}</style>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <FiUpload className="inline mr-1" size={12} />
            Supported format: JSON file with questions array
          </p>
        </div>

        {/* ================= QUESTIONS LIST ================= */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200" style={{ backgroundColor: '#f8faf8' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">
                  Generated Questions ({questions.length})
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selected.length} of {questions.length} selected
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs px-3 py-1.5 rounded-md font-medium transition-all border-2"
                    style={{
                      color: '#074F06',
                      borderColor: '#074F06',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#E8F5E9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                    }}
                  >
                    {selected.length === questions.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {questions.map((q, idx) => {
                const isSelected = selected.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`p-4 transition-all cursor-pointer ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => toggleSelection(q.id)}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300 bg-white'
                            }`}
                        >
                          {isSelected && <FiCheck className="text-white" size={14} />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-500">Q{idx + 1}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  backgroundColor: q.type === 'mcq' ? '#E3F2FD' : '#FFF3E0',
                                  color: q.type === 'mcq' ? '#1565C0' : '#E65100'
                                }}
                              >
                                {q.type === 'mcq' ? 'Multiple Choice' : 'True/False'}
                              </span>
                            </div>
                            <p className="font-medium text-gray-800">{q.text}</p>
                          </div>
                        </div>

                        {/* Options */}
                        {q.type !== "tf" && q.options && (
                          <div className="mt-3 space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isCorrect = q.answer === letter;

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-start gap-2 text-sm p-2 rounded ${isCorrect ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                                    }`}
                                >
                                  <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                                    {letter}.
                                  </span>
                                  <span className={isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}>
                                    {opt}
                                  </span>
                                  {isCorrect && (
                                    <FiCheckCircle className="text-green-600 ml-auto flex-shrink-0" size={16} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Answer for True/False */}
                        {q.type === "tf" && (
                          <div className="mt-3 flex items-center gap-2 p-2 bg-green-100 border border-green-300 rounded text-sm">
                            <FiCheckCircle className="text-green-600" size={16} />
                            <span className="font-bold text-green-700">Answer:</span>
                            <span className="text-green-800 font-medium">{q.answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#f8faf8' }}>
              <button
                onClick={handleSubmit}
                disabled={selected.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => {
                  if (selected.length > 0) {
                    e.target.style.backgroundColor = '#053d05';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#074F06';
                }}
              >
                <FiCheckCircle size={20} />
                Submit {selected.length} Selected Question{selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <FiFileText size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Questions Loaded</h3>
            <p className="text-sm text-gray-500">
              Upload a JSON file to get started with creating your test
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
