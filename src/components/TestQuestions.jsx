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

  // Generate unique storage key for this test attempt
  const getStorageKey = (suffix) => `test_${testId}_${student_id}_${suffix}`;

  // Check if test is already submitted and fetch results
  const checkIfSubmitted = async () => {
    try {
      const submittedFlag = localStorage.getItem(getStorageKey('submitted'));
      if (submittedFlag === 'true') {
        // Test already submitted, fetch and show results
        console.log('Test already submitted, fetching results...');
        await fetchSubmittedResults();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking submission status:', err);
      return false;
    }
  };

  // Fetch results for already submitted test
  const fetchSubmittedResults = async () => {
    try {
      setLoading(true);
      const res = await test.getQuestionsByTestId(testId);

      if (!res || !res.questions) {
        console.error('No questions found');
        navigate('/student-dashboard');
        return;
      }

      setExamMeta(res);
      setQuestions(res.questions);

      // Load saved answers and calculate score
      const savedAnswers = localStorage.getItem(getStorageKey('answers'));
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers);
        setUserAnswers(answers);

        // Calculate score
        let result = 0;
        res.questions.forEach((q) => {
          if (answers[q.id] === q.answer) result++;
        });
        setScore(result);
      } else {
        // No saved answers, redirect to dashboard
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

  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const savedAnswers = localStorage.getItem(getStorageKey('answers'));
      const savedReviewed = localStorage.getItem(getStorageKey('reviewed'));
      const savedStartTime = localStorage.getItem(getStorageKey('startTime'));
      const savedCurrentIndex = localStorage.getItem(getStorageKey('currentIndex'));

      let hasState = false;
      if (savedAnswers) {
        setUserAnswers(JSON.parse(savedAnswers));
        hasState = true;
      }
      if (savedReviewed) setReviewedQuestions(JSON.parse(savedReviewed));
      if (savedCurrentIndex) setCurrentIndex(parseInt(savedCurrentIndex));

      if (hasState && savedStartTime) {
        setIsResumed(true);
      }

      return savedStartTime ? new Date(savedStartTime) : null;
    } catch (err) {
      console.error('Error loading saved state:', err);
      return null;
    }
  };

  // Save state to localStorage
  const saveState = () => {
    try {
      localStorage.setItem(getStorageKey('answers'), JSON.stringify(userAnswers));
      localStorage.setItem(getStorageKey('reviewed'), JSON.stringify(reviewedQuestions));
      localStorage.setItem(getStorageKey('currentIndex'), currentIndex.toString());
    } catch (err) {
      console.error('Error saving state:', err);
    }
  };

  // Clear test state from localStorage (but keep answers for result display)
  const clearTestState = () => {
    try {
      // DON'T remove answers - we need them to show results
      // localStorage.removeItem(getStorageKey('answers'));

      // Remove temporary state
      localStorage.removeItem(getStorageKey('reviewed'));
      localStorage.removeItem(getStorageKey('startTime'));
      localStorage.removeItem(getStorageKey('currentIndex'));

      // Mark as submitted
      localStorage.setItem(getStorageKey('submitted'), 'true');
    } catch (err) {
      console.error('Error clearing state:', err);
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);

      // Check if already submitted
      const alreadySubmitted = await checkIfSubmitted();
      if (alreadySubmitted) {
        return;
      }

      const res = await test.getQuestionsByTestId(testId);

      if (!res || !res.questions) {
        console.error("No questions found in response:", res);
        setQuestions([]);
        return;
      }

      setExamMeta(res);
      setQuestions(res.questions);

      const map = {};
      res.questions.forEach((q) => {
        if (q && q.id) {
          map[q.id] = q.answer;
        }
      });
      setCorrectAnswers(map);

      // Try to load saved state
      const savedStartTime = loadSavedState();

      let actualStartTime;
      if (savedStartTime) {
        // Resuming test
        actualStartTime = savedStartTime;
        console.log('Resuming test from:', savedStartTime);
      } else {
        // Starting fresh
        actualStartTime = new Date();
        localStorage.setItem(getStorageKey('startTime'), actualStartTime.toISOString());
        console.log('Starting new test at:', actualStartTime);
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
    console.log('=== EXAM TIMING DEBUG ===');
    console.log('Raw exam object:', exam);
    console.log('Exam type:', exam.exam_type);
    console.log('Duration minutes from API:', exam.duration_minutes);

    if (exam.exam_type === "UNTIMED") {
      console.log('Test is UNTIMED, no timer set');
      return;
    }

    if (exam.exam_type === "TIMED") {
      const totalSeconds = exam.duration_minutes * 60;

      // Calculate elapsed time since start
      const now = new Date();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);

      console.log('Timer calculation:', {
        duration_minutes: exam.duration_minutes,
        totalSeconds,
        elapsedSeconds,
        remaining,
        remainingMinutes: Math.floor(remaining / 60),
        startTime: startTime.toISOString(),
        now: now.toISOString()
      });

      setRemainingSeconds(remaining);

      // If time already expired, trigger auto-submit
      if (remaining <= 0) {
        console.log('Time already expired, triggering auto-submit');
        setTimerExpired(true);
        setTimeout(() => submitTest(true), 100);
      }
      return;
    }
  };

  // Save state whenever answers or reviewed questions change
  useEffect(() => {
    if (!loading && questions.length > 0) {
      saveState();
    }
  }, [userAnswers, reviewedQuestions, currentIndex]);

  useEffect(() => {
    if (remainingSeconds === null) return;

    if (remainingSeconds <= 0) {
      setTimerExpired(true);
      submitTest(true);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  useEffect(() => {
    startTest();
  }, [testId]);

  // Prevent Navigation Logic and Screenshot Prevention
  useEffect(() => {
    if (score !== null) return;

    const preventBack = () => {
      window.history.pushState(null, null, window.location.href);
      alert("You cannot go back during an active test. Please complete and submit your test.");
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", preventBack);

    const preventReload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", preventReload);

    // Prevent screenshots and screen capture
    const preventScreenshot = (e) => {
      // Prevent PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        alert('Screenshots are not allowed during the test!');
        return false;
      }

      // Prevent Ctrl+Shift+S (Firefox screenshot)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        alert('Screenshots are not allowed during the test!');
        return false;
      }

      // Prevent Windows+Shift+S (Windows Snipping Tool)
      if (e.key === 'Meta' && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        alert('Screenshots are not allowed during the test!');
        return false;
      }

      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        alert('Printing is not allowed during the test!');
        return false;
      }
    };

    // Prevent right-click context menu
    const preventContextMenu = (e) => {
      e.preventDefault();
      alert('Right-click is disabled during the test!');
      return false;
    };

    document.addEventListener('keyup', preventScreenshot);
    document.addEventListener('keydown', preventScreenshot);
    document.addEventListener('contextmenu', preventContextMenu);

    // Add CSS to prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      window.removeEventListener("popstate", preventBack);
      window.removeEventListener("beforeunload", preventReload);
      document.removeEventListener('keyup', preventScreenshot);
      document.removeEventListener('keydown', preventScreenshot);
      document.removeEventListener('contextmenu', preventContextMenu);

      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, [score]);

  const handleAnswerChange = (qid, choice) => {
    setUserAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

  const toggleReview = (qid) => {
    setReviewedQuestions((prev) => ({
      ...prev,
      [qid]: !prev[qid]
    }));
  };

  const submitTest = async (autoSubmit = false) => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate call');
      return;
    }

    setIsSubmitting(true);

    try {
      let result = 0;

      // Build correct answers map if not already built
      const correctMap = {};
      questions.forEach((q) => {
        if (q && q.id) {
          correctMap[q.id] = q.answer;
        }
      });
      setCorrectAnswers(correctMap);

      // Calculate score
      questions.forEach((q) => {
        if (userAnswers[q.id] === correctMap[q.id]) result++;
      });

      console.log('Submitting test:', {
        score: result,
        total: questions.length,
        answers: userAnswers
      });

      setScore(result);

      await scoreAPI.postScore({
        test_set_id: examMeta?.test_set_id,
        student_id,
        score: result,
        total_questions: questions.length,
        started_at: startedAt,
        submitted_at: new Date(),
        answers: userAnswers,
      });

      // Clear test state from localStorage after successful submission
      clearTestState();

      if (autoSubmit) {
        console.log('Test auto-submitted due to timer expiry');
      } else {
        console.log('Test submitted manually');
      }

      // Results will be shown because score is now set
      console.log('Submission successful, score set to:', result);
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

  const getScorePercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  const getQuestionStatus = (questionId) => {
    if (reviewedQuestions[questionId]) return 'review';
    if (userAnswers[questionId]) return 'answered';
    return 'unanswered';
  };

  const q = questions.length > 0 ? questions[currentIndex] : null;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#074F06' }}></div>
          <p className="text-lg font-semibold text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Timer Expired State
  if (timerExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-3">
            Time's Up!
          </h2>
          <p className="text-gray-600 mb-6">
            Your test has been automatically submitted.
          </p>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              Please wait while we process your results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Result Page
  if (score !== null) {
    const percentage = getScorePercentage();
    const passed = score >= (examMeta?.pass_threshold || 5);

    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {passed ? (
                <FiCheckCircle size={48} className="text-green-600" />
              ) : (
                <FiXCircle size={48} className="text-red-600" />
              )}
            </div>

            <h2 className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? '🎉 Congratulations!' : 'Test Completed'}
            </h2>

            <p className="text-gray-600 mb-6">
              {passed ? 'You have passed the test!' : 'Keep practicing to improve your score'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#D5F2D5' }}>
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className="text-3xl font-bold" style={{ color: '#074F06' }}>
                  {score} / {questions.length}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: '#D5F2D5' }}>
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-3xl font-bold" style={{ color: '#074F06' }}>
                  {percentage}%
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: '#D5F2D5' }}>
                <p className="text-sm text-gray-600 mb-1">Pass Mark</p>
                <p className="text-3xl font-bold" style={{ color: '#074F06' }}>
                  {examMeta?.pass_threshold || 5} Questions
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/student-dashboard')}
              className="mt-6 px-10 py-3 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
              style={{ backgroundColor: '#074F06' }}
            >
              Back to Dashboard
            </button>
          </div>

          {/* Answer Review */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#074F06' }}>
              Answer Review
            </h3>

            {questions.map((q, idx) => {
              const isCorrect = userAnswers[q.id] === q.answer;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-2"
                  style={{ borderColor: isCorrect ? '#10b981' : '#ef4444' }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                      {isCorrect ? (
                        <FiCheckCircle className="text-green-600" size={20} />
                      ) : (
                        <FiXCircle className="text-red-600" size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-500">Q{idx + 1}.</span>
                        <h4 className="text-lg font-semibold text-gray-800">{q.question_text}</h4>
                      </div>
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {q.options?.length > 0 && (
                    <div className="space-y-2 ml-14">
                      {q.options.map((opt) => {
                        const isCorrectOption = opt.key === q.answer;
                        const isChosenOption = userAnswers[q.id] === opt.key;

                        let bgColor = 'bg-gray-50';
                        let borderColor = 'border-gray-200';
                        let textColor = 'text-gray-700';

                        if (isCorrectOption) {
                          bgColor = 'bg-green-50';
                          borderColor = 'border-green-400';
                          textColor = 'text-green-800';
                        } else if (isChosenOption && !isCorrectOption) {
                          bgColor = 'bg-red-50';
                          borderColor = 'border-red-400';
                          textColor = 'text-red-800';
                        }

                        return (
                          <div
                            key={opt.option_id}
                            className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} flex items-center gap-2`}
                          >
                            {isCorrectOption && <FiCheckCircle className="text-green-600" size={16} />}
                            {isChosenOption && !isCorrectOption && <FiXCircle className="text-red-600" size={16} />}
                            <span><strong>{opt.key})</strong> {opt.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False */}
                  {q.question_type === "tf" && (
                    <div className="space-y-2 ml-14">
                      {["True", "False"].map((val) => {
                        const isCorrectOption = q.answer === val;
                        const isChosenOption = userAnswers[q.id] === val;

                        let bgColor = 'bg-gray-50';
                        let borderColor = 'border-gray-200';
                        let textColor = 'text-gray-700';

                        if (isCorrectOption) {
                          bgColor = 'bg-green-50';
                          borderColor = 'border-green-400';
                          textColor = 'text-green-800';
                        } else if (isChosenOption && !isCorrectOption) {
                          bgColor = 'bg-red-50';
                          borderColor = 'border-red-400';
                          textColor = 'text-red-800';
                        }

                        return (
                          <div
                            key={val}
                            className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} flex items-center gap-2`}
                          >
                            {isCorrectOption && <FiCheckCircle className="text-green-600" size={16} />}
                            {isChosenOption && !isCorrectOption && <FiXCircle className="text-red-600" size={16} />}
                            <span>{val}</span>
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
    );
  }

  // Test Taking UI
  const answeredCount = Object.keys(userAnswers).length;
  const reviewedCount = Object.keys(reviewedQuestions).filter(k => reviewedQuestions[k]).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Question Navigation Sidebar */}
      <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 bg-white shadow-xl overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#074F06' }}>Question Navigator</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-600">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-gray-600">Not Answered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-gray-600">Marked for Review ({reviewedCount})</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, idx) => {
              const status = getQuestionStatus(question.id);
              let bgColor = 'bg-red-500';
              if (status === 'answered') bgColor = 'bg-green-500';
              if (status === 'review') bgColor = 'bg-purple-500';

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-bold text-white transition-all hover:scale-110 ${bgColor} ${currentIndex === idx ? 'ring-4 ring-offset-2 ring-blue-400' : ''
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Resumed Test Notification */}
          {isResumed && !score && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-blue-600" size={20} />
                <div>
                  <p className="font-semibold text-blue-800">Test Resumed</p>
                  <p className="text-sm text-blue-700">Your previous progress has been restored. Continue from where you left off.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#074F06' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
                  <FaClipboardCheck className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#074F06' }}>
                    {examMeta?.test_title || 'Test'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {examMeta?.exam_type} • {questions.length} Questions
                  </p>
                </div>
              </div>

              {/* Timer */}
              {remainingSeconds !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${remainingSeconds < 300 ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                  <FiClock size={20} className={remainingSeconds < 300 ? 'text-red-600' : 'text-blue-600'} />
                  <span className={`text-lg font-bold ${remainingSeconds < 300 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{answeredCount} answered • {reviewedCount} marked</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: '#074F06'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              {q && (
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: '#074F06' }}>
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      {q.question_text}
                    </h2>
                    {!userAnswers[q.id] && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                        <FiAlertCircle size={16} />
                        <span className="text-sm font-medium">Please select an answer</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q && q.options?.length > 0 &&
                q.options.map((opt) => (
                  <label
                    key={opt.option_id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${userAnswers[q.id] === opt.key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      className="mr-4 w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#074F06' }}
                      checked={userAnswers[q.id] === opt.key}
                      onChange={() => handleAnswerChange(q.id, opt.key)}
                    />
                    <span className="flex-1">
                      <strong className="mr-2">{opt.key})</strong>
                      {opt.value}
                    </span>
                    {userAnswers[q.id] === opt.key && (
                      <FiCheckCircle className="text-green-600" size={20} />
                    )}
                  </label>
                ))}

              {/* True/False */}
              {q && q.question_type === "tf" && (
                <>
                  {["True", "False"].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${userAnswers[q.id] === val
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        className="mr-4 w-5 h-5 cursor-pointer"
                        style={{ accentColor: '#074F06' }}
                        checked={userAnswers[q.id] === val}
                        onChange={() => handleAnswerChange(q.id, val)}
                      />
                      <span className="flex-1 font-medium">{val}</span>
                      {userAnswers[q.id] === val && (
                        <FiCheckCircle className="text-green-600" size={20} />
                      )}
                    </label>
                  ))}
                </>
              )}

              {!q && (
                <div className="text-center py-10">
                  <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No questions found for this test.</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
                }`}
            >
              <FiArrowLeft size={18} />
              Previous
            </button>

            {/* Mark as Review Button */}
            {q && (
              <button
                onClick={() => toggleReview(q.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${reviewedQuestions[q.id]
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 border-2 border-purple-600'
                  }`}
              >
                <MdFlag size={18} />
                {reviewedQuestions[q.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ backgroundColor: '#074F06' }}
              >
                Next
                <FiArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={submitTest}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:bg-green-700"
              >
                <FiCheckCircle size={20} />
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestions;