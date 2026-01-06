import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import testAPI from "../entities/test";
import setTestAPI from "../entities/settest";
import scoreAPI from "../entities/score";
import {
  FiDownload,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
  FiEye,
  FiXCircle,
  FiAlertCircle,
  FiAward,
  FiTrash2
} from "react-icons/fi";
import { FaClipboardList } from "react-icons/fa";
import CreateSubTestModal from "./CreateSubTestModal";

const ClassWiseScore = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [open, setOpen] = useState(false);
  const [testSetResults, setTestSetResults] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedSetName, setSelectedSetName] = useState("");
  const [loadingResults, setLoadingResults] = useState(false);

  const [data, setData] = useState({
    test_id: null,
    total_sets: 0,
    sets: []
  });

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const data1 = await setTestAPI.getSetTest(testId);
      setData(data1);
      // Automatically select first set if available and not selected
      if (data1.sets.length > 0 && !selectedSetId) {
        handleTestData(data1.sets[0].set_id, data1.sets[0].set_name);
      }
    } catch (err) {
      console.error("Failed to load score data", err);
    }
  };

  const handleTestData = async (testSetId, setName) => {
    try {
      // Clear previous results while loading
      setTestSetResults(null);
      setSelectedSetId(testSetId);
      setSelectedSetName(setName);
      setLoadingResults(true);

      const data2 = await scoreAPI.getTestSetResults(testSetId);
      setTestSetResults(data2);
    } catch (err) {
      console.error("Failed to load test set results", err);
      // Show user-friendly error message
      const errorMessage = err.message || "Failed to load test set results";
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. The backend server is running\n2. The endpoint exists\n3. You have proper permissions`);

      // Reset selection on error
      setSelectedSetId(null);
      setSelectedSetName("");
      setTestSetResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleDeleteSet = async (e, setId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this sub-test set?")) {
      try {
        await setTestAPI.deleteSubTest(setId);
        alert("Sub-test deleted successfully");
        if (selectedSetId === setId) {
          setTestSetResults(null);
          setSelectedSetId(null);
        }
        fetchData();
      } catch (err) {
        alert("Failed to delete sub-test");
      }
    }
  };

  const getExamTypeColor = (examType) => {
    switch (examType) {
      case "TIMED":
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case "FIXED_TIME":
        return { bg: '#E9D5FF', text: '#6B21A8' };
      case "UNTIMED":
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#E5E7EB', text: '#374151' };
    }
  };

  const calculateStats = () => {
    if (!testSetResults?.results) return { attempted: 0, passed: 0, failed: 0, notAttempted: 0 };

    const attempted = testSetResults.results.filter(s => s.score !== null).length;
    const passed = testSetResults.results.filter(s => s.score !== null && s.score >= testSetResults.pass_threshold).length;
    const failed = testSetResults.results.filter(s => s.score !== null && s.score < testSetResults.pass_threshold).length;
    const notAttempted = testSetResults.results.filter(s => s.score === null).length;

    return { attempted, passed, failed, notAttempted };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4" style={{ backgroundColor: '#f0fdf4' }}>

      {/* Header Section - Compact & Professional */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#D5F2D5' }}>
              <FaClipboardList size={20} style={{ color: '#074F06' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#074F06' }}>
                Test Analytics Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Monitor test performance across sub-test sets</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: '#074F06' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
            >
              <FiPlus size={16} />
              Create Sub-Test
            </button>

            <button
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/tests/download/${testId}`, "_blank")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:shadow-md"
              style={{
                color: '#074F06',
                borderColor: '#074F06',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#D5F2D5';
                e.target.style.borderColor = '#053d05';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#074F06';
              }}
            >
              <FiDownload size={16} />
              Download Questions PDF
            </button>

            <button
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/report/all-sets/${testId}`, "_blank")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-md"
              style={{
                backgroundColor: '#074F06',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#053d05';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#074F06';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FiDownload size={16} />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Sub-Test Sets Cards */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
              <FiFileText size={18} />
              Available Sub-Test Sets
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{data.total_sets} {data.total_sets === 1 ? 'set' : 'sets'} available</p>
          </div>
        </div>

        {data.sets.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block p-3 rounded-full mb-3" style={{ backgroundColor: '#D5F2D5' }}>
              <FiFileText size={24} style={{ color: '#074F06' }} />
            </div>
            <p className="text-sm text-gray-500">No sub-tests generated yet. Create your first sub-test to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {data.sets.map((set) => {
              const isSelected = selectedSetId === set.set_id;
              const typeColors = getExamTypeColor(set.exam_type);

              return (
                <div
                  key={set.set_id}
                  onClick={() => handleTestData(set.set_id, set.set_name)}
                  className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${isSelected
                    ? 'border-[#074F06] shadow-lg'
                    : 'border-gray-200 hover:border-[#074F06] hover:shadow-md'
                    }`}
                  style={{
                    backgroundColor: isSelected ? '#D5F2D5' : 'white'
                  }}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-[#074F06]"></div>
                  )}

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-base font-bold truncate flex-1 ${isSelected ? 'text-[#074F06]' : 'text-gray-800'}`}>
                        {set.set_name}
                      </h3>
                      <span
                        className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0"
                        style={{ backgroundColor: typeColors.bg, color: typeColors.text }}
                      >
                        {set.exam_type?.charAt(0) || 'U'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/subtest/download/${set.set_id}`, "_blank");
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[9px] font-bold transition-all border"
                          style={{
                            backgroundColor: isSelected ? 'white' : '#f9fafb',
                            borderColor: isSelected ? '#074F06' : '#e5e7eb',
                            color: isSelected ? '#074F06' : '#6b7280'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f0fdf4';
                            e.target.style.borderColor = '#074F06';
                            e.target.style.color = '#074F06';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = isSelected ? 'white' : '#f9fafb';
                            e.target.style.borderColor = isSelected ? '#074F06' : '#e5e7eb';
                            e.target.style.color = isSelected ? '#074F06' : '#6b7280';
                          }}
                          title="Download Questions"
                        >
                          <FiDownload size={10} />
                          Questions
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/subtest/download-results/${set.set_id}`, "_blank");
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[9px] font-bold transition-all border shadow-sm"
                          style={{
                            backgroundColor: '#074F06',
                            borderColor: '#074F06',
                            color: 'white'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#053d05';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#074F06';
                          }}
                          title="Download Results"
                        >
                          <FiDownload size={10} />
                          Results
                        </button>

                        <button
                          onClick={(e) => handleDeleteSet(e, set.set_id)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all flex-shrink-0"
                          title="Delete Set"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Results Section */}
      {loadingResults && (
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3" style={{ borderColor: '#074F06' }}></div>
            <p className="text-sm text-gray-600">Loading test results...</p>
          </div>
        </div>
      )}

      {testSetResults && !loadingResults && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex-grow flex flex-col">

          {/* Results Header with Stats */}
          <div className="p-4 border-b" style={{ backgroundColor: '#f9fafb' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#074F06' }}>
                  <FiAward size={18} />
                  {selectedSetName} - Results
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Student performance analysis</p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{
                backgroundColor: '#D5F2D5',
                borderColor: '#074F06'
              }}>
                <span className="text-[10px] font-semibold text-gray-600 uppercase">Pass Mark:</span>
                <span className="text-sm font-bold" style={{ color: '#074F06' }}>{testSetResults.pass_threshold} Correct</span>
              </div>

              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/subtest/download-results/${selectedSetId}`, "_blank")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#074F06' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#053d05'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#074F06'}
              >
                <FiDownload size={16} />
                Download Full Set Report
              </button>
            </div>

            {/* Stats Cards - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg border" style={{
                backgroundColor: '#f0f9ff',
                borderColor: '#bfdbfe'
              }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FiUsers size={14} className="text-blue-600" />
                  <span className="text-[10px] font-semibold text-gray-600 uppercase">Total</span>
                </div>
                <p className="text-xl font-bold text-blue-600">{testSetResults.results?.length || 0}</p>
              </div>

              <div className="p-3 rounded-lg border" style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#bbf7d0'
              }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FiCheckCircle size={14} className="text-green-600" />
                  <span className="text-[10px] font-semibold text-gray-600 uppercase">Passed</span>
                </div>
                <p className="text-xl font-bold text-green-600">{stats.passed}</p>
              </div>

              <div className="p-3 rounded-lg border" style={{
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca'
              }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FiXCircle size={14} className="text-red-600" />
                  <span className="text-[10px] font-semibold text-gray-600 uppercase">Failed</span>
                </div>
                <p className="text-xl font-bold text-red-600">{stats.failed}</p>
              </div>

              <div className="p-3 rounded-lg border" style={{
                backgroundColor: '#fffbeb',
                borderColor: '#fde68a'
              }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FiClock size={14} className="text-amber-600" />
                  <span className="text-[10px] font-semibold text-gray-600 uppercase">Pending</span>
                </div>
                <p className="text-xl font-bold text-amber-600">{stats.notAttempted}</p>
              </div>
            </div>
          </div>

          {/* Results Table - Compact & Professional */}
          <div className="overflow-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#074F06' }}>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white w-12 text-center">#</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white">Student Information</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white text-center">Batch / Regiment</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white text-center">Performance</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testSetResults.results?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full" style={{ backgroundColor: '#D5F2D5' }}>
                          <FiUsers size={24} style={{ color: '#074F06' }} />
                        </div>
                        <p className="text-sm text-gray-500">No students assigned or attempted this set yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  testSetResults.results?.map((student, index) => {
                    const attempted = student.score !== null;
                    const passed = attempted && student.score >= testSetResults.pass_threshold;

                    return (
                      <tr
                        key={student.student_id}
                        className="border-b border-gray-100 hover:bg-[#f9fafb] transition-colors"
                        style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}
                      >
                        <td className="px-4 py-3 text-center">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{
                            backgroundColor: '#D5F2D5',
                            color: '#074F06'
                          }}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: '#074F06' }}>
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{student.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{student.army_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-block px-2.5 py-1 rounded-md" style={{ backgroundColor: '#D5F2D5' }}>
                            <p className="text-xs font-semibold text-gray-800">{student.batch_no}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{student.regiment}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attempted ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`px-3 py-1.5 rounded-md font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className="text-base">{student.score}</span>
                                <span className="text-[10px] ml-1">/ {testSetResults.results?.length > 0 ? testSetResults.results[0].total_questions || 'N/A' : 'N/A'}</span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {passed ? ' Pass' : ' Fail'}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200">
                              <FiClock size={12} className="text-amber-600" />
                              <span className="text-[10px] font-bold text-amber-700 uppercase">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={!attempted}
                              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/download/${selectedSetId}/${student.student_id}`, "_blank")}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${attempted
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                }`}
                              title="Download Test PDF"
                            >
                              <FiDownload size={12} />
                              PDF
                            </button>

                            <button
                              disabled={!attempted}
                              onClick={() => navigate(`/review/${testSetResults.test_set_id}/${student.student_id}`)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${attempted
                                ? 'text-white hover:shadow-md'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                              style={attempted ? { backgroundColor: '#074F06' } : {}}
                              onMouseEnter={(e) => {
                                if (attempted) e.target.style.backgroundColor = '#053d05';
                              }}
                              onMouseLeave={(e) => {
                                if (attempted) e.target.style.backgroundColor = '#074F06';
                              }}
                              title="Review Test"
                            >
                              <FiAward size={12} />
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Sub-Test Modal */}
      {open && (
        <CreateSubTestModal
          testId={testId}
          onClose={() => {
            setOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default ClassWiseScore;