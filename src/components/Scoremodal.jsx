
import React, { useEffect, useState } from "react";
import testAPI from "../entities/test";
import Users from "../entities/users";
import { useNavigate } from "react-router-dom";
import {
  FiEdit,
  FiTrash2,
  FiArrowRight,
  FiPlus,
  FiFilter,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiUsers,
  FiDownload
} from "react-icons/fi";
import { FaClipboardList, FaRobot, FaMicrochip } from "react-icons/fa";
import GenerateTest from "./GenerateTest";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#061E29',
  panel: 'rgba(10,37,51,0.6)',
  border: 'rgba(0,194,199,0.18)',
  borderHover: 'rgba(0,194,199,0.4)',
  accent: '#00C2C7',
  accentDim: 'rgba(0,194,199,0.12)',
  text: '#F3F4F4',
  textMuted: 'rgba(243,244,244,0.45)',
  textSub: 'rgba(0,194,199,0.55)',
};

const PanelStyle = {
  background: T.panel,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${T.border}`,
  borderRadius: 16,
};

const BtnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '0.5rem 1.1rem',
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
  border: `1px solid ${T.accent}`,
  background: T.accentDim,
  color: T.accent,
  transition: 'all 0.18s',
};

const BtnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '0.5rem 0.9rem',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(243,244,244,0.65)',
  transition: 'all 0.18s',
};

const TestManagement = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  const [tests, setTests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [editTestId, setEditTestId] = useState(null);
  const [editTestName, setEditTestName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { loadTests(); }, [selectedInstructorId]);

  const loadTests = async () => {
    try {
      let data;
      if (role === "admin") {
        if (instructors.length === 0) {
          const inst = await Users.getByRole("Instructor");
          setInstructors(inst.filter(i => i.name !== "System Admin"));
        }
        data = selectedInstructorId
          ? await testAPI.getAllTests(selectedInstructorId)
          : await testAPI.getAllTests();
      } else if (role === "Student") {
        data = await testAPI.getAllTests(userId, "Student");
      } else {
        data = await testAPI.getAllTests(userId);
      }
      setTests(data);
    } catch (err) { console.error("Error loading tests", err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      await testAPI.deleteTest(id);
      loadTests();
    }
  };

  const handleEdit = (id, name) => { setEditTestId(id); setEditTestName(name); };
  const handleUpdate = async () => {
    await testAPI.updateTest(editTestId, editTestName);
    setEditTestId(null); setEditTestName(""); loadTests();
  };
  const cancelEdit = () => { setEditTestId(null); setEditTestName(""); };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: T.bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div style={{
              width: 52, height: 52, flexShrink: 0,
              background: T.accentDim,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaClipboardList size={26} color={T.accent} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ letterSpacing: '-0.5px' }}>
                Test Management
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: T.textSub }}>
                {role === "admin" ? "Manage all tests across instructors"
                  : role === "Instructor" ? "Create and manage your tests"
                    : "View and take your assigned tests"}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div style={{ ...PanelStyle, padding: '1rem 1.25rem' }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40,
                  background: T.accentDim,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiFileText size={20} color={T.accent} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Total Tests</p>
                  <p className="text-2xl font-black text-white">{tests.length}</p>
                </div>
              </div>
            </div>

            {role === "admin" && (
              <div style={{ ...PanelStyle, padding: '1rem 1.25rem' }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 40, height: 40,
                    background: T.accentDim,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {/* <FaRobot size={20} color={T.accent} /> */}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Instructors</p>
                    <p className="text-2xl font-black text-white">{instructors.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Filter */}
          {role === "admin" && (
            <div style={{ ...PanelStyle, padding: '1.25rem 1.5rem' }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 34, height: 34,
                    background: T.accentDim,
                    border: `1px solid ${T.border}`,
                    borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FiFilter size={16} color={T.accent} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Filter by Instructor</p>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>View tests by specific instructor</p>
                  </div>
                </div>
                <div className="flex-1 md:max-w-xs">
                  <select
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                    style={{
                      width: '100%', padding: '0.6rem 0.9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.border}`,
                      background: 'rgba(0,194,199,0.07)',
                      color: T.text,
                      outline: 'none',
                      fontSize: 13, fontWeight: 600
                    }}
                  >
                    <option value="" style={{ background: '#0a2533' }}>All Instructors ({instructors.length})</option>
                    {instructors.map(i => (
                      <option key={i.id} value={i.id} style={{ background: '#0a2533' }}>{i.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tests List ─────────────────────────────────────────────────── */}
        {tests.length === 0 ? (
          <div className="text-center py-16">
            <div style={{
              width: 72, height: 72,
              background: T.accentDim,
              border: `1px solid ${T.border}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FiFileText size={32} color={T.accent} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">No Tests Found</h3>
            <p className="text-sm" style={{ color: T.textMuted }}>
              {role === "Instructor" ? "Create your first test to get started" : "No tests available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, idx) => (
              <div
                key={test.id}
                style={{
                  ...PanelStyle,
                  padding: '1.25rem 1.5rem',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHover}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Test Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div style={{
                      width: 42, height: 42, flexShrink: 0,
                      background: T.accentDim,
                      border: `1px solid ${T.border}`,
                      borderRadius: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, color: T.accent, fontSize: 16
                    }}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editTestId === test.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editTestName}
                            onChange={(e) => setEditTestName(e.target.value)}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: '0.45rem 0.75rem',
                              borderRadius: 8,
                              border: `1px solid ${T.accent}`,
                              background: 'rgba(0,194,199,0.07)',
                              color: T.text,
                              outline: 'none',
                              fontSize: 14
                            }}
                          />
                          <button onClick={handleUpdate} style={{ ...BtnPrimary, padding: '0.45rem 0.7rem' }} title="Save">
                            <FiCheckCircle size={16} />
                          </button>
                          <button onClick={cancelEdit} style={{ ...BtnGhost, padding: '0.45rem 0.7rem' }} title="Cancel">✕</button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-base font-black text-white truncate">
                            {test.title || `${test.test_title} — ${test.set_name}`}
                          </h3>

                          {test.class_name && (
                            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest" style={{
                              background: T.accentDim,
                              border: `1px solid ${T.border}`,
                              color: T.accent
                            }}>
                              <FiUsers size={10} />
                              {test.class_name}
                            </div>
                          )}

                          {role === "Student" && test.exam_type && (
                            <div className="flex flex-wrap items-center gap-3 text-xs mt-2" style={{ color: T.textMuted }}>
                              <span className="flex items-center gap-1"><FiFileText size={12} />{test.total_questions} Questions</span>
                              <span className="flex items-center gap-1"><FiClock size={12} />{test.exam_type}</span>
                              {test.exam_type === "TIMED" && <span className="flex items-center gap-1"><FiClock size={12} />{test.duration_minutes} mins</span>}
                              <span className="flex items-center gap-1"><FiAward size={12} />Pass: {test.pass_threshold} Score</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">

                    {/* Student Actions */}
                    {role === "Student" && (
                      <>
                        {test.score === null ? (
                          <button
                            onClick={() => navigate(`/${test.test_set_id}/questions`)}
                            style={BtnPrimary}
                          >
                            <FiArrowRight size={15} />
                            Start Exam
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: 8,
                              background: 'rgba(52,211,153,0.1)',
                              border: '1px solid rgba(52,211,153,0.25)',
                              color: '#34d399',
                              fontSize: 12, fontWeight: 800
                            }}>
                              {test.score} / {test.total_questions}
                            </div>
                            <button
                              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/score/download/${test.test_set_id}/${userId}`, "_blank")}
                              style={BtnGhost}
                              title="Download Result PDF"
                            >
                              <FiDownload size={14} />
                              PDF
                            </button>
                            <button
                              onClick={() => navigate(`/review/${test.test_set_id}/${userId}`)}
                              style={BtnPrimary}
                            >
                              <FiArrowRight size={14} />
                              Review
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Instructor/Admin Actions */}
                    {role !== "Student" && editTestId !== test.id && (
                      <>
                        <button
                          onClick={() => navigate(`/${test.id}/review`)}
                          style={BtnPrimary}
                          title="Open Test"
                        >
                          <FiArrowRight size={15} />
                          Open
                        </button>
                        <button
                          onClick={() => handleEdit(test.id, test.title)}
                          style={{ ...BtnGhost, padding: '0.5rem 0.6rem' }}
                          title="Edit"
                        >
                          <FiEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          style={{
                            ...BtnGhost,
                            padding: '0.5rem 0.6rem',
                            color: 'rgba(248,113,113,0.8)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            background: 'rgba(248,113,113,0.05)'
                          }}
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Test Modal */}
        {open && <GenerateTest onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
};

export default TestManagement;