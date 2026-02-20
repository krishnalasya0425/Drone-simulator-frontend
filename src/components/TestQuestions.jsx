import test from "../entities/test.jsx";
import scoreAPI from "../entities/score.jsx";
import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBookmark
} from "react-icons/fi";
import { FaClipboardCheck } from "react-icons/fa";
import { MdFlag } from "react-icons/md";

const TestQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examMeta, setExamMeta] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  const { testId } = useParams();
  const student_id = localStorage.getItem("id");
  const navigate = useNavigate();

  const getStorageKey = (suffix) => `test_${testId}_${student_id}_${suffix}`;

  const checkIfSubmitted = async () => {
    try {
      const submittedFlag = localStorage.getItem(getStorageKey('submitted'));
      if (submittedFlag === 'true') {
        await fetchSubmittedResults();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking submission status:', err);
      return false;
    }
  };

  const fetchSubmittedResults = async () => {
    try {
      setLoading(true);
      const res = await test.getQuestionsByTestId(testId);
      if (!res || !res.questions) {
        navigate('/student-dashboard');
        return;
      }
      setExamMeta(res);
      setQuestions(res.questions);
      const savedAnswers = localStorage.getItem(getStorageKey('answers'));
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers);
        setUserAnswers(answers);
        let result = 0;
        res.questions.forEach((q) => {
          if (answers[q.id] === q.answer) result++;
        });
        setScore(result);
      } else {
        alert('No test data found. Redirecting to dashboard...');
        navigate('/student-dashboard');
      }
    } catch (err) {
      console.error('Error fetching submitted results:', err);
      navigate('/student-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedState = () => {
    try {
      const savedAnswers = localStorage.getItem(getStorageKey('answers'));
      const savedReviewed = localStorage.getItem(getStorageKey('reviewed'));
      const savedStartTime = localStorage.getItem(getStorageKey('startTime'));
      const savedCurrentIndex = localStorage.getItem(getStorageKey('currentIndex'));
      let hasState = false;
      if (savedAnswers) { setUserAnswers(JSON.parse(savedAnswers)); hasState = true; }
      if (savedReviewed) setReviewedQuestions(JSON.parse(savedReviewed));
      if (savedCurrentIndex) setCurrentIndex(parseInt(savedCurrentIndex));
      if (hasState && savedStartTime) setIsResumed(true);
      return savedStartTime ? new Date(savedStartTime) : null;
    } catch (err) {
      console.error('Error loading saved state:', err);
      return null;
    }
  };

  const saveState = () => {
    try {
      localStorage.setItem(getStorageKey('answers'), JSON.stringify(userAnswers));
      localStorage.setItem(getStorageKey('reviewed'), JSON.stringify(reviewedQuestions));
      localStorage.setItem(getStorageKey('currentIndex'), currentIndex.toString());
    } catch (err) {
      console.error('Error saving state:', err);
    }
  };

  const clearTestState = () => {
    try {
      localStorage.removeItem(getStorageKey('reviewed'));
      localStorage.removeItem(getStorageKey('startTime'));
      localStorage.removeItem(getStorageKey('currentIndex'));
      localStorage.setItem(getStorageKey('submitted'), 'true');
    } catch (err) {
      console.error('Error clearing state:', err);
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);
      const alreadySubmitted = await checkIfSubmitted();
      if (alreadySubmitted) return;
      const res = await test.getQuestionsByTestId(testId);
      if (!res || !res.questions) { setQuestions([]); return; }
      setExamMeta(res);
      setQuestions(res.questions);
      const map = {};
      res.questions.forEach((q) => { if (q && q.id) map[q.id] = q.answer; });
      setCorrectAnswers(map);
      const savedStartTime = loadSavedState();
      let actualStartTime;
      if (savedStartTime) {
        actualStartTime = savedStartTime;
      } else {
        actualStartTime = new Date();
        localStorage.setItem(getStorageKey('startTime'), actualStartTime.toISOString());
      }
      setStartedAt(actualStartTime);
      handleExamTiming(res, actualStartTime);
    } catch (err) {
      console.error("Error starting test:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamTiming = (exam, startTime) => {
    if (exam.exam_type === "UNTIMED") return;
    if (exam.exam_type === "TIMED") {
      const totalSeconds = exam.duration_minutes * 60;
      const now = new Date();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setTimerExpired(true);
        setTimeout(() => submitTest(true), 100);
      }
    }
  };

  useEffect(() => {
    if (!loading && questions.length > 0) saveState();
  }, [userAnswers, reviewedQuestions, currentIndex]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) { setTimerExpired(true); submitTest(true); return; }
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) { clearInterval(interval); return 0; }
        return newValue;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  useEffect(() => { startTest(); }, [testId]);

  useEffect(() => {
    if (score !== null) return;
    const preventBack = () => {
      window.history.pushState(null, null, window.location.href);
      alert("You cannot go back during an active test. Please complete and submit your test.");
    };
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", preventBack);
    const preventReload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", preventReload);
    const preventScreenshot = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) { e.preventDefault(); alert('Screenshots are not allowed!'); return false; }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') { e.preventDefault(); alert('Screenshots are not allowed!'); return false; }
      if (e.ctrlKey && e.key === 'p') { e.preventDefault(); alert('Printing is not allowed!'); return false; }
    };
    const preventContextMenu = (e) => { e.preventDefault(); alert('Right-click is disabled!'); return false; };
    document.addEventListener('keyup', preventScreenshot);
    document.addEventListener('keydown', preventScreenshot);
    document.addEventListener('contextmenu', preventContextMenu);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    return () => {
      window.removeEventListener("popstate", preventBack);
      window.removeEventListener("beforeunload", preventReload);
      document.removeEventListener('keyup', preventScreenshot);
      document.removeEventListener('keydown', preventScreenshot);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, [score]);

  const handleAnswerChange = (qid, choice) => setUserAnswers((prev) => ({ ...prev, [qid]: choice }));

  const toggleReview = (qid) => setReviewedQuestions((prev) => ({ ...prev, [qid]: !prev[qid] }));

  const submitTest = async (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let result = 0;
      const correctMap = {};
      questions.forEach((q) => { if (q && q.id) correctMap[q.id] = q.answer; });
      setCorrectAnswers(correctMap);
      questions.forEach((q) => { if (userAnswers[q.id] === correctMap[q.id]) result++; });
      setScore(result);
      await scoreAPI.postScore({
        test_set_id: examMeta?.test_set_id,
        student_test_set_id: examMeta?.student_test_set_id,
        student_id,
        score: result,
        total_questions: questions.length,
        started_at: startedAt,
        submitted_at: new Date(),
        answers: userAnswers,
      });
      clearTestState();
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScorePercentage = () => Math.round((score / questions.length) * 100);

  const getQuestionStatus = (questionId) => {
    if (reviewedQuestions[questionId]) return 'review';
    if (userAnswers[questionId]) return 'answered';
    return 'unanswered';
  };

  const q = questions.length > 0 ? questions[currentIndex] : null;

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#061E29' }}>
        <div className="text-center">
          <div style={{
            width: 64, height: 64,
            border: '3px solid rgba(0,194,199,0.2)',
            borderTopColor: '#00C2C7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(0,194,199,0.7)' }}>
            Loading mission briefing...
          </p>
        </div>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ─── Timer Expired ──────────────────────────────────────────────────────────
  if (timerExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#061E29' }}>
        <div style={{
          maxWidth: 440, width: '100%',
          background: 'rgba(10,37,51,0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 24,
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(239,68,68,0.1)'
        }}>
          <div style={{
            width: 80, height: 80,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <FiClock size={40} color="#f87171" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ color: '#f87171' }}>Time's Up!</h2>
          <p className="mb-6" style={{ color: 'rgba(243,244,244,0.5)' }}>
            Your test has been automatically submitted.
          </p>
          <div style={{
            padding: '1rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12
          }}>
            <p className="text-sm font-medium" style={{ color: 'rgba(248,113,113,0.8)' }}>
              Please wait while we process your results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Result Page ─────────────────────────────────────────────────────────────
  if (score !== null) {
    const percentage = getScorePercentage();
    const passed = score >= (examMeta?.pass_threshold || 5);

    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#061E29' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Result Hero Card */}
          <div style={{
            background: 'rgba(10,37,51,0.7)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${passed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            borderRadius: 24,
            padding: '2.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            boxShadow: `0 0 40px ${passed ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)'}`
          }}>
            {/* Icon */}
            <div style={{
              width: 96, height: 96,
              background: passed ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
              border: `2px solid ${passed ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: `0 0 30px ${passed ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}`
            }}>
              {passed
                ? <FiCheckCircle size={48} color="#34d399" />
                : <FiXCircle size={48} color="#f87171" />
              }
            </div>

            <h2 className="text-4xl font-black uppercase mb-2" style={{ color: passed ? '#34d399' : '#f87171', letterSpacing: '-0.5px' }}>
              {passed ? '🎉 Mission Passed!' : 'Mission Complete'}
            </h2>
            <p className="mb-8" style={{ color: 'rgba(243,244,244,0.45)' }}>
              {passed ? 'Outstanding performance. You have cleared the assessment.' : 'Keep training to improve your score.'}
            </p>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Your Score', value: `${score} / ${questions.length}` },
                { label: 'Percentage', value: `${percentage}%` },
                { label: 'Status', value: passed ? 'PASS' : 'FAIL', highlight: true }
              ].map((card, i) => (
                <div key={i} style={{
                  background: 'rgba(0,194,199,0.06)',
                  border: '1px solid rgba(0,194,199,0.2)',
                  borderRadius: 16,
                  padding: '1.25rem'
                }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(0,194,199,0.5)' }}>{card.label}</p>
                  <p className="text-3xl font-black" style={{
                    color: card.highlight
                      ? (passed ? '#34d399' : '#f87171')
                      : '#00C2C7'
                  }}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-10 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #00C2C7, #0099a3)',
                color: '#061E29',
                boxShadow: '0 0 20px rgba(0,194,199,0.3)',
                letterSpacing: '0.08em'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Answer Review Section */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: '#00C2C7', letterSpacing: '-0.3px' }}>
              Answer Review
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = userAnswers[q.id] === q.answer;

                return (
                  <div
                    key={q.id}
                    style={{
                      background: 'rgba(10,37,51,0.6)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      borderRadius: 16,
                      padding: '1.5rem',
                      boxShadow: `0 0 15px ${isCorrect ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)'}`
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div style={{
                        width: 38, height: 38,
                        borderRadius: 10,
                        background: isCorrect ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                        border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {isCorrect
                          ? <FiCheckCircle color="#34d399" size={18} />
                          : <FiXCircle color="#f87171" size={18} />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(0,194,199,0.5)' }}>Q{idx + 1}</span>
                        </div>
                        <h4 className="text-base font-semibold text-white">{q.question_text}</h4>
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {q.options?.length > 0 && (
                      <div className="space-y-2 ml-12">
                        {q.options.map((opt) => {
                          const isCorrectOption = opt.key === q.answer;
                          const isChosenOption = userAnswers[q.id] === opt.key;
                          let bg = 'rgba(255,255,255,0.03)';
                          let border = 'rgba(255,255,255,0.08)';
                          let color = 'rgba(243,244,244,0.6)';
                          if (isCorrectOption) { bg = 'rgba(52,211,153,0.1)'; border = 'rgba(52,211,153,0.4)'; color = '#34d399'; }
                          else if (isChosenOption) { bg = 'rgba(248,113,113,0.1)'; border = 'rgba(248,113,113,0.4)'; color = '#f87171'; }
                          return (
                            <div key={opt.option_id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '0.6rem 1rem', color, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isCorrectOption && <FiCheckCircle size={14} color="#34d399" />}
                              {isChosenOption && !isCorrectOption && <FiXCircle size={14} color="#f87171" />}
                              <span className="text-sm"><strong>{opt.key})</strong> {opt.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False */}
                    {q.question_type === "tf" && (
                      <div className="space-y-2 ml-12">
                        {["True", "False"].map((val) => {
                          const isCorrectOption = q.answer === val;
                          const isChosenOption = userAnswers[q.id] === val;
                          let bg = 'rgba(255,255,255,0.03)';
                          let border = 'rgba(255,255,255,0.08)';
                          let color = 'rgba(243,244,244,0.6)';
                          if (isCorrectOption) { bg = 'rgba(52,211,153,0.1)'; border = 'rgba(52,211,153,0.4)'; color = '#34d399'; }
                          else if (isChosenOption) { bg = 'rgba(248,113,113,0.1)'; border = 'rgba(248,113,113,0.4)'; color = '#f87171'; }
                          return (
                            <div key={val} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '0.6rem 1rem', color, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isCorrectOption && <FiCheckCircle size={14} color="#34d399" />}
                              {isChosenOption && !isCorrectOption && <FiXCircle size={14} color="#f87171" />}
                              <span className="text-sm font-medium">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ─── Active Test UI ──────────────────────────────────────────────────────────
  const answeredCount = Object.keys(userAnswers).length;
  const reviewedCount = Object.keys(reviewedQuestions).filter(k => reviewedQuestions[k]).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#061E29' }}>

      {/* ── Question Navigator Sidebar ─────────────────────────────────────── */}
      <div
        className="transition-all duration-300 overflow-hidden flex flex-col"
        style={{
          width: showSidebar ? 264 : 0,
          background: 'rgba(6,22,34,0.96)',
          borderRight: '1px solid rgba(0,194,199,0.15)',
          flexShrink: 0
        }}
      >
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(0,194,199,0.1)' }}>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Question Navigator</h3>

          {/* Legend */}
          <div className="space-y-1.5">
            {[
              { color: '#34d399', label: `Answered (${answeredCount})` },
              { color: '#f87171', label: `Not Answered (${questions.length - answeredCount})` },
              { color: '#a78bfa', label: `Marked for Review (${reviewedCount})` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                <span className="text-xs" style={{ color: 'rgba(243,244,244,0.55)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '1rem' }}>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((question, idx) => {
              const status = getQuestionStatus(question.id);
              let bg = '#f87171';
              let shadow = 'rgba(248,113,113,0.3)';
              if (status === 'answered') { bg = '#34d399'; shadow = 'rgba(52,211,153,0.3)'; }
              if (status === 'review') { bg = '#a78bfa'; shadow = 'rgba(167,139,250,0.3)'; }

              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 8,
                    background: bg,
                    color: '#061E29',
                    fontWeight: 900,
                    fontSize: 12,
                    border: isCurrent ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: isCurrent ? `0 0 12px ${shadow}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '1.5rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Resumed Banner */}
          {isResumed && !score && (
            <div style={{
              marginBottom: 16,
              padding: '0.75rem 1rem',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <FiAlertCircle color="#60a5fa" size={18} />
              <div>
                <p className="font-black text-sm" style={{ color: '#60a5fa' }}>Mission Resumed</p>
                <p className="text-xs" style={{ color: 'rgba(96,165,250,0.7)' }}>Your previous progress has been restored.</p>
              </div>
            </div>
          )}

          {/* Header Card */}
          <div style={{
            background: 'rgba(10,37,51,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,194,199,0.2)',
            borderRadius: 20,
            padding: '1.25rem 1.5rem',
            marginBottom: 20
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: 'rgba(0,194,199,0.08)',
                    border: '1px solid rgba(0,194,199,0.2)',
                    color: '#00C2C7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div style={{
                  width: 42, height: 42,
                  background: 'linear-gradient(135deg, #00C2C7, #0099a3)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FaClipboardCheck color="#061E29" size={20} />
                </div>

                <div>
                  <h1 className="text-xl font-black text-white" style={{ letterSpacing: '-0.3px' }}>
                    {examMeta?.test_title || 'Test'}
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(0,194,199,0.5)' }}>
                    {examMeta?.exam_type} · {questions.length} Questions
                  </p>
                </div>
              </div>

              {/* Timer */}
              {remainingSeconds !== null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.5rem 1rem',
                  borderRadius: 10,
                  background: remainingSeconds < 300 ? 'rgba(248,113,113,0.1)' : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${remainingSeconds < 300 ? 'rgba(248,113,113,0.3)' : 'rgba(59,130,246,0.3)'}`,
                  color: remainingSeconds < 300 ? '#f87171' : '#60a5fa'
                }}>
                  <FiClock size={18} />
                  <span className="text-lg font-black">{formatTime(remainingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(243,244,244,0.4)' }}>
                <span className="font-bold">Question {currentIndex + 1} of {questions.length}</span>
                <span>{answeredCount} answered · {reviewedCount} marked</span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #00C2C7, #0099a3)',
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 10px rgba(0,194,199,0.4)'
                }} />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div style={{
            background: 'rgba(10,37,51,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,194,199,0.2)',
            borderRadius: 20,
            padding: '2rem',
            marginBottom: 20
          }}>
            {q && (
              <div className="flex items-start gap-4 mb-6">
                <div style={{
                  width: 46, height: 46,
                  background: 'linear-gradient(135deg, #00C2C7, #0099a3)',
                  borderRadius: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: '#061E29', fontSize: 18, flexShrink: 0,
                  boxShadow: '0 0 15px rgba(0,194,199,0.3)'
                }}>
                  {currentIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white mb-3">{q.question_text}</h2>
                  {!userAnswers[q.id] && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '0.4rem 0.8rem',
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.25)',
                      borderRadius: 8,
                      color: '#fbbf24',
                      fontSize: 12, fontWeight: 700
                    }}>
                      <FiAlertCircle size={14} />
                      Please select an answer
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {q && q.options?.length > 0 && q.options.map((opt) => {
                const isSelected = userAnswers[q.id] === opt.key;
                return (
                  <label
                    key={opt.option_id}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isSelected ? 'rgba(0,194,199,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(0,194,199,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isSelected ? '0 0 15px rgba(0,194,199,0.1)' : 'none'
                    }}
                  >
                    <input
                      type="radio"
                      className="mr-4 w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#00C2C7' }}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(q.id, opt.key)}
                    />
                    <span className="flex-1 text-sm" style={{ color: isSelected ? '#00C2C7' : 'rgba(243,244,244,0.75)' }}>
                      <strong className="mr-2" style={{ color: isSelected ? '#00C2C7' : 'rgba(243,244,244,0.4)' }}>{opt.key})</strong>
                      {opt.value}
                    </span>
                    {isSelected && <FiCheckCircle color="#00C2C7" size={18} />}
                  </label>
                );
              })}

              {/* True/False */}
              {q && q.question_type === "tf" && (
                <>
                  {["True", "False"].map((val) => {
                    const isSelected = userAnswers[q.id] === val;
                    return (
                      <label
                        key={val}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '1rem 1.25rem',
                          borderRadius: 14,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? 'rgba(0,194,199,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(0,194,199,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: isSelected ? '0 0 15px rgba(0,194,199,0.1)' : 'none'
                        }}
                      >
                        <input
                          type="radio"
                          className="mr-4 w-5 h-5 cursor-pointer"
                          style={{ accentColor: '#00C2C7' }}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(q.id, val)}
                        />
                        <span className="flex-1 text-sm font-semibold" style={{ color: isSelected ? '#00C2C7' : 'rgba(243,244,244,0.75)' }}>{val}</span>
                        {isSelected && <FiCheckCircle color="#00C2C7" size={18} />}
                      </label>
                    );
                  })}
                </>
              )}

              {!q && (
                <div className="text-center py-10">
                  <FiAlertCircle size={40} style={{ margin: '0 auto 12px', color: 'rgba(0,194,199,0.3)' }} />
                  <p style={{ color: 'rgba(243,244,244,0.35)' }}>No questions found for this test.</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                background: currentIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${currentIndex === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`,
                color: currentIndex === 0 ? 'rgba(243,244,244,0.2)' : 'rgba(243,244,244,0.6)'
              }}
            >
              <FiArrowLeft size={18} />
              Previous
            </button>

            {/* Mark for Review */}
            {q && (
              <button
                onClick={() => toggleReview(q.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.75rem 1.5rem',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: reviewedQuestions[q.id] ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.06)',
                  border: `1px solid ${reviewedQuestions[q.id] ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.25)'}`,
                  color: '#a78bfa'
                }}
              >
                <MdFlag size={18} />
                {reviewedQuestions[q.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.75rem 1.5rem',
                  borderRadius: 12,
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'linear-gradient(135deg, #00C2C7, #0099a3)',
                  color: '#061E29',
                  boxShadow: '0 0 18px rgba(0,194,199,0.25)'
                }}
              >
                Next
                <FiArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={submitTest}
                disabled={isSubmitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.75rem 2rem',
                  borderRadius: 12,
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  background: isSubmitting
                    ? 'rgba(52,211,153,0.4)'
                    : 'linear-gradient(135deg, #34d399, #10b981)',
                  color: '#061E29',
                  boxShadow: '0 0 18px rgba(52,211,153,0.25)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                <FiCheckCircle size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default TestQuestions;