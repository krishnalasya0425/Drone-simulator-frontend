

import test from "../entities/test.jsx";
import score1 from "../entities/score.jsx";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";


const TestQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);


  const testName = "JavaScript Basic Test"; 

  const { testId } = 12;

  const student_id = localStorage.getItem("id")

  useEffect(() => {
  startTest();
}, [testId]);


 const startTest = async () => {
  try {
    setLoading(true);
    const fetchQuestions = await test.getQuestionsByTestId(testId);
    setQuestions(fetchQuestions);

    const map = {};
    fetchQuestions.forEach((q) => (map[q.id] = q.answer));
    setCorrectAnswers(map);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleAnswerChange = (qid, choice) => {
    setUserAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

  const submitTest = async () => {
    let result = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] === correctAnswers[q.id]) result++;
    });

    setScore(result);

    await score1.postScore(testId, student_id, result, questions.length);
  };

  const q = questions[currentIndex];

  if (loading) {
  return (
    <div className="p-6 text-center text-lg font-semibold">
      Loading questions...
    </div>
  );
}


  // =========================================================================================
  // RESULT PAGE UI
  // =========================================================================================
  if (score !== null) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-green-600">
          🎉 Test Completed!
        </h2>

        <h3 className="text-xl text-center mb-8 font-semibold">
          Your Score: <span className="text-blue-600">{score}</span> / {questions.length}
        </h3>

        <div className="space-y-6">
          {questions.map((q) => {
            return (
              <div
                key={q.id}
                className="p-4 bg-white shadow rounded-lg border"
              >
                <h3 className="font-bold text-lg">{q.question_text}</h3>

                {q.options?.length > 0 &&
                  q.options.map((opt) => {
                    const isCorrect = opt.key === q.answer;
                    const isChosen = userAnswers[q.id] === opt.key;

                    let style =
                      "p-3 rounded-lg mt-2 border transition";

                    if (isCorrect) {
                      style += " bg-green-100 border-green-400";
                    } else if (isChosen && !isCorrect) {
                      style += " bg-red-100 border-red-400";
                    } else {
                      style += " bg-gray-50 border-gray-300";
                    }

                    return (
                      <div key={opt.option_id} className={style}>
                        <strong>{opt.key})</strong> {opt.value}
                      </div>
                    );
                  })}

                {/* For True/False */}
                {q.question_type === "tf" && (
                  <div className="mt-3">
                    {["True", "False"].map((val) => {
                      const isCorrect = q.answer === val;
                      const isChosen = userAnswers[q.id] === val;

                      let style =
                        "p-3 rounded-lg mt-2 border transition";

                      if (isCorrect) {
                        style += " bg-green-100 border-green-400";
                      } else if (isChosen && !isCorrect) {
                        style += " bg-red-100 border-red-400";
                      } else {
                        style += " bg-gray-50 border-gray-300";
                      }

                      return (
                        <div key={val} className={style}>
                          {val}
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
    );
  }

  // =========================================================================================
  // TEST UI
  // =========================================================================================

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* ===================== TEST TITLE ===================== */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">{testName}</h1>
        <p className="text-gray-600">
          Answer all questions carefully. Each question carries 1 mark.
        </p>
      </div>

      {/* ======================== START BUTTON ======================== */}
      {/* {questions.length === 0 && (
        <div className="text-center">
          <button
            onClick={startTest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Start Test
          </button>
        </div>
      )} */}

      {/* ====================== QUESTIONS UI ====================== */}
      {questions.length > 0 && (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>

          {/* Question Title */}
          <h2 className="mt-6 text-xl font-semibold">{q.question_text}</h2>

          {/* Options */}
          <div className="mt-4 space-y-3">
            {q.options?.length > 0 &&
              q.options.map((opt) => (
                <label
                  key={opt.option_id}
                  className="flex items-center p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    className="mr-3"
                    checked={userAnswers[q.id] === opt.key}
                    onChange={() => handleAnswerChange(q.id, opt.key)}
                  />
                  <span>
                    <strong>{opt.key})</strong> {opt.value}
                  </span>
                </label>
              ))}

            {/* TF Questions */}
            {q.question_type === "tf" && (
              <>
                {["True", "False"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      className="mr-3"
                      checked={userAnswers[q.id] === val}
                      onChange={() => handleAnswerChange(q.id, val)}
                    />
                    {val}
                  </label>
                ))}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className={`px-4 py-2 rounded-lg ${
                currentIndex === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              Previous
            </button>

            {/* Next or Submit */}
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitTest}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Test
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TestQuestions;