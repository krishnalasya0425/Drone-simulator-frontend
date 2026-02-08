import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import scoreAPI from "../entities/score";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiUser,
  FiFileText,
  FiCalendar,
  FiClock,
  FiAward
} from "react-icons/fi";
import { FaClipboardCheck } from "react-icons/fa";

const TestReview = () => {
  const navigate = useNavigate();
  const { test_set_id, student_id } = useParams();

  const [testReview, setTestReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const data = await scoreAPI.getTestReview(student_id, test_set_id);
     
      setTestReview(data);
    } catch (error) {
      console.error("Error fetching test review:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student_id && test_set_id) {
      fetchReview();
    }
  }, [student_id, test_set_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 mx-auto mb-3" style={{ borderColor: '#074F06' }}></div>
          <p className="text-sm font-medium text-gray-600">Loading test review...</p>
        </div>
      </div>
    );
  }

  if (!testReview || !testReview.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiInfo size={24} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">No Review Data Found</h2>
          <p className="text-sm text-gray-600 mb-6">Detailed review for this test attempt is currently unavailable.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FiArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = testReview.total_questions > 0
    ? Math.round((testReview.score / testReview.total_questions) * 100)
    : 0;
  const passed = testReview.score >= (testReview.pass_threshold || 5);

  // Format date safely


  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#f0fdf4' }}>
      <div className="max-w-6xl mx-auto">

        {/* Back Button - Compact */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <FiArrowLeft size={16} />
          <span>Back to Results</span>
        </button>

        {/* Summary Header - Professional & Compact */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-4">
          {/* Header Section */}
          <div className="p-4 border-b" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: passed ? '#D5F2D5' : '#fee2e2' }}>
                  <FaClipboardCheck className={passed ? 'text-green-700' : 'text-red-700'} size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Test Review</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">{testReview.student_name || "Student"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {passed ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                    {passed ? 'PASSED' : 'FAILED'}
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Score</p>
                  <p className="text-xl font-bold" style={{ color: '#074F06' }}>
                    {testReview?.score ?? 0}
                    <span className="text-sm text-gray-400 font-normal"> / {testReview?.total_questions ?? 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-t">
            <div className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ backgroundColor: '#fffbeb' }}>
                <FiAward className="text-amber-600" size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Percentage</p>
                <p className="text-base font-bold text-gray-800">{scorePercentage}%</p>
              </div>
            </div>
            <div className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ backgroundColor: '#eff6ff' }}>
                <FiClock className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Time Taken</p>
                <p className="text-base font-bold text-gray-800">
                  {testReview.exam_type === 'UNTIMED'
                    ? 'Untimed'
                    : `${testReview.time_taken || "--"} mins`}
                </p>
              </div>
            </div>
            <div className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ backgroundColor: '#f0fdf4' }}>
                <FiCalendar className="text-green-600" size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Date Attempted</p>
                <p className="text-base font-bold text-gray-800">
                  {testReview.submitted_at ? new Date(testReview.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--'}
                </p>
              </div>
            </div>
            <div className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md" style={{ backgroundColor: passed ? '#D5F2D5' : '#fee2e2' }}>
                {passed ? <FiCheckCircle className="text-green-600" size={16} /> : <FiXCircle className="text-red-600" size={16} />}
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Status</p>
                <p className={`text-base font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  {passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
              <FaClipboardCheck size={18} />
              Question Analysis
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-medium">Correct</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-medium">Incorrect</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {testReview.questions.map((q, idx) => {
              const isCorrect = q.selected_answer === q.correct_answer;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 overflow-hidden transition-all hover:shadow-md ${isCorrect ? 'border-green-500' : 'border-red-500'}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-xs ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">
                            {q.question_text}
                          </h3>
                          {isCorrect ? (
                            <FiCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                          ) : (
                            <FiXCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                          )}
                        </div>

                        {/* MCQ Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options?.length > 0 ? (
                            q.options.map((opt) => {
                              const isCorrectOption = opt.key === q.correct_answer;
                              const isSelectedOption = q.selected_answer === opt.key;

                              let bgStyle = "bg-gray-50 border-gray-200";
                              let icon = null;

                              if (isCorrectOption) {
                                bgStyle = "bg-green-50 border-green-400";
                                icon = <FiCheckCircle className="text-green-600" size={16} />;
                              } else if (isSelectedOption && !isCorrectOption) {
                                bgStyle = "bg-red-50 border-red-400";
                                icon = <FiXCircle className="text-red-600" size={16} />;
                              }

                              return (
                                <div
                                  key={opt.option_id}
                                  className={`p-2.5 rounded-md border flex items-center justify-between transition-all ${bgStyle}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold border">
                                      {opt.key}
                                    </span>
                                    <span className={`text-xs font-medium ${isCorrectOption ? 'text-green-900' : isSelectedOption ? 'text-red-900' : 'text-gray-700'}`}>
                                      {opt.value}
                                    </span>
                                  </div>
                                  {icon}
                                </div>
                              );
                            })
                          ) : (
                            // True/False
                            ["True", "False"].map((val) => {
                              const isCorrectOption = val === q.correct_answer;
                              const isSelectedOption = q.selected_answer === val;

                              let bgStyle = "bg-gray-50 border-gray-200";
                              let icon = null;

                              if (isCorrectOption) {
                                bgStyle = "bg-green-50 border-green-400";
                                icon = <FiCheckCircle className="text-green-600" size={16} />;
                              } else if (isSelectedOption && !isCorrectOption) {
                                bgStyle = "bg-red-50 border-red-400";
                                icon = <FiXCircle className="text-red-600" size={16} />;
                              }

                              return (
                                <div
                                  key={val}
                                  className={`p-2.5 rounded-md border flex items-center justify-between transition-all ${bgStyle}`}
                                >
                                  <span className={`text-xs font-bold ${isCorrectOption ? 'text-green-900' : isSelectedOption ? 'text-red-900' : 'text-gray-700'}`}>
                                    {val}
                                  </span>
                                  {icon}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Status Message - Compact */}
                        {!isCorrect && (
                          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
                            <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                              Correct: <span className="font-bold">{q.correct_answer}</span> •
                              Selected: <span className="font-bold">{q.selected_answer || "None"}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// Internal icon for target if not imported
const FiTarget = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

export default TestReview;