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
    <div className="min-h-screen relative overflow-hidden bg-[#061E29] text-[#F3F4F4] font-['Inter',_sans-serif]">
      {/* Dynamic Tactical Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,194,199,0.05)_0%,_transparent_70%)] animate-pulse"
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#00C2C7 1px, transparent 1px), linear-gradient(90deg, #00C2C7 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="floating-orb orb-1 opacity-20"></div>
        <div className="floating-orb orb-2 opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-6">
        {/* Navigation HUD */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#1D546D]/20 border border-[#5F9598]/20 text-[#00C2C7] font-black uppercase tracking-widest text-[10px] hover:bg-[#00C2C7] hover:text-[#061E29] transition-all duration-300 shadow-[0_0_20px_rgba(0,194,199,0.1)] hover:shadow-[0_0_30px_rgba(0,194,199,0.3)]"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={14} />
          <span>Abort Review & Return</span>
        </button>

        {/* Mission Status Header */}
        <div className="glass-container border-[#00C2C7]/30 p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaClipboardCheck size={100} className={passed ? 'text-[#34d399]' : 'text-[#f87171]'} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${passed ? 'bg-gradient-to-br from-[#061E29] to-[#34d399]/40 border-[#34d399]/50' : 'bg-gradient-to-br from-[#061E29] to-[#f87171]/40 border-[#f87171]/50'}`}>
                {passed ? <FiCheckCircle size={32} className="text-[#34d399]" /> : <FiXCircle size={32} className="text-[#f87171]" />}
              </div>
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 text-gradient">
                  Mission Review
                </h1>
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-0.5 bg-[#00C2C7]/10 border border-[#00C2C7]/30 rounded">
                    <span className="text-[#00C2C7] font-black uppercase tracking-widest text-[9px]">OPERATIVE: {testReview.student_name || "REDACTED"}</span>
                  </div>
                  <div className={`px-2.5 py-0.5 border rounded ${passed ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]' : 'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]'}`}>
                    <span className="font-black uppercase tracking-widest text-[9px]">{passed ? 'STATUS: SUCCESS' : 'STATUS: FAILURE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[#5F9598] font-black uppercase tracking-widest text-[9px] mb-1.5 opacity-60">Accuracy</p>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(95, 149, 152, 0.1)" strokeWidth="5" />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke={passed ? '#34d399' : '#f87171'}
                      strokeWidth="5"
                      strokeDasharray={`${scorePercentage * 2.2} 220`}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(0,194,199,0.3)]"
                    />
                  </svg>
                  <span className="text-xl font-black italic">{scorePercentage}%</span>
                </div>
              </div>

              <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#5F9598]/30 to-transparent" />

              <div className="text-center">
                <p className="text-[#5F9598] font-black uppercase tracking-widest text-[9px] mb-1.5 opacity-60">Score Matrix</p>
                <div className="text-3xl font-black italic text-[#F3F4F4]">
                  {testReview?.score ?? 0}
                  <span className="text-base text-[#5F9598] ml-1 opacity-50">/{testReview?.total_questions ?? 0}</span>
                </div>
                <div className="h-1 w-full bg-[#1D546D]/30 rounded-full mt-2 overflow-hidden border border-[#5F9598]/20">
                  <div
                    className={`h-full rounded-full ${passed ? 'bg-[#34d399]' : 'bg-[#f87171]'}`}
                    style={{ width: `${scorePercentage}%`, boxShadow: passed ? '0 0 10px #34d399' : '0 0 10px #f87171' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            <div className="bg-[#0a2533]/50 border border-[#5F9598]/20 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <FiClock className="text-[#00C2C7]" size={16} />
                <div>
                  <p className="text-[#5F9598] font-black uppercase tracking-widest text-[8px]">TIME EXPENDED</p>
                  <p className="text-sm font-black italic whitespace-nowrap">
                    {testReview.exam_type === 'UNTIMED' ? 'RECONNAISSANCE' : `${testReview.time_taken || "--"} MINUTES`}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a2533]/50 border border-[#5F9598]/20 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <FiCalendar className="text-[#00C2C7]" size={16} />
                <div>
                  <p className="text-[#5F9598] font-black uppercase tracking-widest text-[8px]">DATE RECORDED</p>
                  <p className="text-sm font-black italic whitespace-nowrap">
                    {testReview.submitted_at ? new Date(testReview.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'UNKNOWN'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a2533]/50 border border-[#5F9598]/20 rounded-xl p-3 backdrop-blur-md col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <FiAward className="text-[#00C2C7]" size={16} />
                <div>
                  <p className="text-[#5F9598] font-black uppercase tracking-widest text-[8px]">THRESHOLD</p>
                  <p className="text-sm font-black italic whitespace-nowrap">{testReview.pass_threshold} POINTS REQUIRED</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Question Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#F3F4F4]">
              Tactical Question Breakdown
            </h2>
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1D546D]/20 border border-[#5F9598]/20 rounded-lg backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#34d399]"></div>
                <span className="text-[8px] font-black uppercase text-[#F3F4F4]/60">CORRECT</span>
              </div>
              <div className="w-px h-3 bg-[#5F9598]/30"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#f87171]"></div>
                <span className="text-[8px] font-black uppercase text-[#F3F4F4]/60">INCORRECT</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {testReview.questions.map((q, idx) => {
              const isCorrect = q.selected_answer === q.correct_answer;

              return (
                <div
                  key={q.question_id}
                  className={`glass-container border-y-0 border-r-0 border-l-[4px] transition-all hover:translate-x-1 duration-300 ${isCorrect ? 'border-[#34d399]/60' : 'border-[#f87171]/60'}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm italic shadow-lg ${isCorrect ? 'bg-[#34d399] text-[#061E29]' : 'bg-[#f87171] text-[#061E29]'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-lg font-bold text-[#F3F4F4] leading-tight flex-1">
                            {q.question_text}
                          </h3>
                        </div>

                        {/* HUD Options Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {q.options?.length > 0 ? (
                            q.options.map((opt) => {
                              const isCorrectOption = opt.key === q.correct_answer;
                              const isSelectedOption = q.selected_answer === opt.key;

                              let bgStyle = "bg-[#0a2533]/30 border-[#5F9598]/20 text-[#F3F4F4]/70";
                              let glowStyle = "";

                              if (isCorrectOption) {
                                bgStyle = "bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399]";
                                glowStyle = "shadow-[0_0_15px_rgba(52,211,153,0.15)]";
                              } else if (isSelectedOption && !isCorrectOption) {
                                bgStyle = "bg-[#f87171]/10 border-[#f87171]/40 text-[#f87171]";
                                glowStyle = "shadow-[0_0_15px_rgba(248,113,113,0.15)]";
                              }

                              return (
                                <div
                                  key={opt.option_id}
                                  className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${bgStyle} ${glowStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-black border ${isCorrectOption ? 'bg-[#34d399] text-[#061E29] border-[#34d399]' : isSelectedOption ? 'bg-[#f87171] text-[#061E29] border-[#f87171]' : 'bg-[#1D546D]/20 border-[#5F9598]/30 text-[#00C2C7]'}`}>
                                      {opt.key}
                                    </span>
                                    <span className="text-xs font-bold tracking-tight">
                                      {opt.value}
                                    </span>
                                  </div>
                                  {isCorrectOption && <FiCheckCircle className="text-[#34d399]" size={16} />}
                                  {isSelectedOption && !isCorrectOption && <FiXCircle className="text-[#f87171]" size={16} />}
                                </div>
                              );
                            })
                          ) : (
                            // True/False Recon
                            ["True", "False"].map((val) => {
                              const isCorrectOption = val === q.correct_answer;
                              const isSelectedOption = q.selected_answer === val;

                              let bgStyle = "bg-[#0a2533]/30 border-[#5F9598]/20 text-[#F3F4F4]/70";
                              if (isCorrectOption) bgStyle = "bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399]";
                              else if (isSelectedOption && !isCorrectOption) bgStyle = "bg-[#f87171]/10 border-[#f87171]/40 text-[#f87171]";

                              return (
                                <div
                                  key={val}
                                  className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${bgStyle}`}
                                >
                                  <span className="text-xs font-black uppercase tracking-widest">
                                    {val}
                                  </span>
                                  {isCorrectOption && <FiCheckCircle className="text-[#34d399]" size={16} />}
                                  {isSelectedOption && !isCorrectOption && <FiXCircle className="text-[#f87171]" size={16} />}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Debriefing Insight */}
                        {!isCorrect && (
                          <div className="mt-5 p-3.5 bg-[#00C2C7]/5 border border-[#00C2C7]/20 rounded-xl flex items-start gap-2.5 backdrop-blur-sm">
                            <FiInfo className="text-[#00C2C7] flex-shrink-0 mt-0.5" size={14} />
                            <div>
                              <p className="text-[9px] font-black text-[#5F9598] uppercase tracking-[0.2em] mb-1">Mission Intelligence</p>
                              <p className="text-xs font-bold text-[#F3F4F4]/90">
                                Tactical error detected. Correct response was <span className="text-[#34d399] font-black italic">{q.correct_answer}</span>.
                                Operative selected <span className="text-[#f87171] font-black italic">{q.selected_answer || "NO RESPONSE"}</span>.
                              </p>
                            </div>
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

      <style>{`
        .glass-container {
          background: rgba(10, 37, 51, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .text-gradient {
          background: linear-gradient(135deg, #F3F4F4 0%, #00C2C7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
        }
        .orb-1 { width: 400px; height: 400px; top: -100px; right: -100px; background: rgba(0, 194, 199, 0.15); }
        .orb-2 { width: 300px; height: 300px; bottom: -50px; left: -50px; background: rgba(29, 84, 109, 0.1); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default TestReview;

// Internal icon for target if not imported
const FiTarget = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);