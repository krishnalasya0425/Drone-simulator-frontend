import React, { useState } from "react";
import {
  FiX,
  FiLayers,
  FiHash,
  FiClock,
  FiCalendar,
  FiAward,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";

const CreateSubTestModal = ({ testId, onClose }) => {
  const [sets, setSets] = useState(1);
  const [questions, setQuestions] = useState(5);
  const [examType, setExamType] = useState("UNTIMED");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [passThreshold, setPassThreshold] = useState(3);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      if (!passThreshold || passThreshold < 0) {
        alert("📊 Please enter a valid pass threshold");
        return;
      }

      if (passThreshold > questions) {
        alert(`⚠️ Pass mark cannot be greater than the total questions (${questions})`);
        return;
      }

      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/subtest/${testId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            numberOfSets: sets,
            questionsPerSet: questions,
            examType,
            durationMinutes: duration || null,
            startTime: examType === "FIXED_TIME" ? startTime : null,
            endTime: examType === "FIXED_TIME" ? endTime : null,
            passThreshold: passThreshold
          })
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create subsets");
      }

      alert("🚀 subsets created successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create subsets. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 text-white flex items-center justify-between" style={{ backgroundColor: '#074F06' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiLayers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Sub-Sets</h2>
              <p className="text-xs text-white/70">Configure your exam parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto space-y-6">

          <div className="grid grid-cols-2 gap-6">
            {/* Number of Sets */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FiLayers className="text-green-700" size={16} />
                Number of Sets
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={sets}
                  onChange={e => setSets(+e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-green-700 focus:ring-0 transition-all outline-none font-medium"
                />
              </div>
            </div>

            {/* Questions per Set */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FiHash className="text-green-700" size={16} />
                Questions/Set
              </label>
              <input
                type="number"
                min="1"
                value={questions}
                onChange={e => setQuestions(+e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-green-700 focus:ring-0 transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Exam Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FiClock className="text-green-700" size={16} />
              Exam Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['UNTIMED', 'TIMED', 'FIXED_TIME'].map((type) => (
                <button
                  key={type}
                  onClick={() => setExamType(type)}
                  className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${examType === type
                    ? 'bg-green-50 border-green-700 text-green-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pass Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FiAward className="text-green-700" size={16} />
                Pass Mark (Count)
              </label>
              <input
                type="number"
                min="0"
                value={passThreshold}
                onChange={e => setPassThreshold(+e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-green-700 focus:ring-0 transition-all outline-none font-medium"
              />
            </div>

            {/* Conditional Duration */}
            {examType === "TIMED" && (
              <div className="space-y-2 animate-scale-in">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiClock className="text-blue-700" size={16} />
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Minutes"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-700 focus:ring-0 transition-all outline-none font-medium"
                />
              </div>
            )}
          </div>

          {/* Fixed Time Parameters */}
          {examType === "FIXED_TIME" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-purple-700" size={16} />
                  Start Window
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-700 focus:ring-0 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-purple-700" size={16} />
                  End Window
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-700 focus:ring-0 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100 shadow-sm">
            <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Creating sub-tests will automatically partition the main test questions into randomized sets based on your selection.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-10 py-3 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
            style={{ backgroundColor: '#074F06' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiCheckCircle size={20} />
                <span>Create Sub-Sets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubTestModal;