import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import testAPI from "../entities/test";
import { FiDownload, FiUsers, FiCheckCircle, FiClock, FiFilter } from "react-icons/fi";
import { FaLayerGroup } from "react-icons/fa";

const ClassWiseScore = () => {
  const { testId } = useParams();
  const [scoreData, setScoreData] = useState(null);
  const [selectedSet, setSelectedSet] = useState("all");

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const data = await testAPI.getTestScoreInfo(testId);
      setScoreData(data);
    } catch (err) {
      console.error("Failed to load score data", err);
    }
  };

  // Calculate set statistics
  const setStats = useMemo(() => {
    if (!scoreData) return {};

    const stats = {
      all: { total: 0, completed: 0, pending: 0 },
      "Set-A": { total: 0, completed: 0, pending: 0 },
      "Set-B": { total: 0, completed: 0, pending: 0 },
      "Set-C": { total: 0, completed: 0, pending: 0 },
      "Set-D": { total: 0, completed: 0, pending: 0 },
    };

    scoreData.students.forEach(student => {
      const set = student.set || "Set-A";
      const attempted = student.score !== null;

      stats.all.total++;
      stats[set].total++;

      if (attempted) {
        stats.all.completed++;
        stats[set].completed++;
      } else {
        stats.all.pending++;
        stats[set].pending++;
      }
    });

    return stats;
  }, [scoreData]);

  // Filter students by selected set
  const filteredStudents = useMemo(() => {
    if (!scoreData) return [];
    if (selectedSet === "all") return scoreData.students;
    return scoreData.students.filter(s => (s.set || "Set-A") === selectedSet);
  }, [scoreData, selectedSet]);

  if (!scoreData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: '#074F06' }}></div>
          <p className="text-gray-600">Loading test scores...</p>
        </div>
      </div>
    );
  }

  const attemptedCount = filteredStudents.filter(s => s.score !== null).length;
  const pendingCount = filteredStudents.length - attemptedCount;

  // Unified green theme for all sets
  const getSetStyle = (set, isSelected) => {
    return {
      bgStyle: { backgroundColor: isSelected ? '#E8F5E9' : '#F8FAF8' },
      borderStyle: { borderColor: isSelected ? '#074F06' : '#D1D5DB' },
      textStyle: { color: '#074F06' },
      badgeStyle: { backgroundColor: '#074F06' }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ================= HEADER SECTION ================= */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h1 className="text-2xl font-bold text-center mb-1" style={{ color: '#074F06' }}>
            {scoreData.test_title}
          </h1>
          <p className="text-center text-gray-600 text-sm mb-4">
            Class: <span className="font-semibold text-gray-800">{scoreData.class_name.trim()}</span>
          </p>

          {/* Overall Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="text-white p-2 rounded" style={{ backgroundColor: '#074F06' }}>
                  <FiUsers size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#074F06' }}>Total</p>
                  <p className="text-xl font-bold" style={{ color: '#074F06' }}>{setStats.all.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white p-2 rounded">
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Completed</p>
                  <p className="text-xl font-bold text-green-700">{setStats.all.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 text-white p-2 rounded">
                  <FiClock size={18} />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-xl font-bold text-amber-700">{setStats.all.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SET BADGES & FILTER ================= */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: '#f8faf8' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaLayerGroup style={{ color: '#074F06' }} size={16} />
                <h2 className="text-base font-bold text-gray-800">Available Sets</h2>
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" size={14} />
                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md outline-none bg-white text-gray-700 text-xs font-medium transition-all"
                  onFocus={(e) => e.target.style.borderColor = '#074F06'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="all">All Sets ({setStats.all.total})</option>
                  <option value="Set-A">Set-A ({setStats["Set-A"].total})</option>
                  <option value="Set-B">Set-B ({setStats["Set-B"].total})</option>
                  <option value="Set-C">Set-C ({setStats["Set-C"].total})</option>
                  <option value="Set-D">Set-D ({setStats["Set-D"].total})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Set Badges - Unified Green Theme */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {["Set-A", "Set-B", "Set-C", "Set-D"].map(set => {
                const isSelected = selectedSet === set;
                const colors = getSetStyle(set, isSelected);
                const stats = setStats[set];

                return (
                  <div
                    key={set}
                    className={`relative border-2 rounded-lg p-3.5 transition-all cursor-pointer ${isSelected ? 'shadow-md' : 'hover:shadow-sm hover:border-gray-400'
                      }`}
                    style={{ ...colors.bgStyle, ...colors.borderStyle }}
                    onClick={() => setSelectedSet(set)}
                  >
                    {/* Set Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white px-3 py-1.5 rounded-md text-xs font-bold" style={colors.badgeStyle}>
                        {set}
                      </span>
                      <span className="text-2xl font-bold" style={colors.textStyle}>{stats.total}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs font-medium mt-2 pt-2.5 border-t border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">{stats.completed} done</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-gray-700">{stats.pending} left</span>
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#074F06' }}>
                        <FiCheckCircle className="text-white" size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_URL}/tests/download/${testId}`,
                "_blank"
              )
            }
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow hover:shadow-lg transition-all text-sm font-semibold"
            style={{ backgroundColor: '#074F06' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
          >
            <FiDownload size={16} /> Test PDF
          </button>

          <button
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_URL}/tests/downloadscore/${testId}`,
                "_blank"
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all text-sm font-semibold"
          >
            <FiDownload size={16} /> Score PDF
          </button>
        </div>

        {/* ================= SCORE TABLE ================= */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-white" style={{ backgroundColor: '#074F06' }}>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Army ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Regiment</th>
                  <th className="px-4 py-3 text-left font-semibold">Batch</th>
                  <th className="px-4 py-3 text-left font-semibold">Set</th>
                  <th className="px-4 py-3 text-center font-semibold">Score</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                      <FiUsers size={40} className="mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">No students found in this set</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const attempted = student.score !== null;
                    const studentSet = student.set || "Set-A";

                    return (
                      <tr
                        key={student.student_id}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-700 font-medium">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800">{student.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{student.army_id}</td>
                        <td className="px-4 py-3 text-gray-600">{student.regiment}</td>
                        <td className="px-4 py-3 text-gray-600">{student.batch_no}</td>
                        <td className="px-4 py-3">
                          <span className="text-white px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#074F06' }}>
                            {studentSet}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {attempted ? (
                            <span className="font-bold" style={{ color: '#074F06' }}>
                              {student.score} / {student.total_questions}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {attempted ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-300">
                              <FiCheckCircle size={12} /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                              <FiClock size={12} /> Not Attempted
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 pb-2">
          Showing {filteredStudents.length} of {scoreData.students.length} students
          {selectedSet !== "all" && ` (${selectedSet})`}
        </div>

      </div>
    </div>
  );
};

export default ClassWiseScore;