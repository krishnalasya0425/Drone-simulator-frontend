import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import setTestAPI from "../entities/settest";
import scoreAPI from "../entities/score";
import {
  FiDownload, FiUsers, FiCheckCircle, FiClock, FiFileText,
  FiXCircle, FiAward, FiTrash2, FiBarChart2, FiChevronRight
} from "react-icons/fi";
import { FaClipboardList } from "react-icons/fa";
import CreateSubTestModal from "./CreateSubTestModal";

/* ─── Palette ──────────────────────────────────────────────────────────────── */
const C = {
  bg: '#07202d',
  surface: '#0c2a38',
  surfaceAlt: '#0f3145',
  border: 'rgba(255,255,255,0.08)',
  borderAccent: 'rgba(0,194,199,0.35)',
  accent: '#00C2C7',
  accentFaint: 'rgba(0,194,199,0.1)',
  textPrimary: '#e8eaeb',
  textSub: 'rgba(232,234,235,0.5)',
  textAccent: '#00C2C7',
};

/* ─── Tiny helpers ─────────────────────────────────────────────────────────── */
const Tag = ({ color, bg, border, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: 5,
    fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
    color, background: bg, border: `1px solid ${border}`
  }}>{children}</span>
);

const Btn = ({ onClick, disabled, icon, children, variant = 'ghost', style: sx = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.38 : 1, transition: 'opacity 0.15s',
    border: 'none', outline: 'none',
    ...sx
  };
  const variants = {
    primary: { background: C.accent, color: C.bg },
    ghost: { background: 'rgba(255,255,255,0.06)', color: C.textPrimary, border: `1px solid ${C.border}` },
    outline: { background: C.accentFaint, color: C.accent, border: `1px solid ${C.borderAccent}` },
    danger: { background: 'rgba(239,68,68,0.07)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
  };
  return (
    <button onClick={!disabled ? onClick : undefined} style={{ ...base, ...variants[variant] }}>
      {icon && <span style={{ lineHeight: 0 }}>{icon}</span>}
      {children}
    </button>
  );
};

const StatCard = ({ label, value, icon, color, bgColor, borderColor }) => (
  <div style={{
    background: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex', flexDirection: 'column', gap: 4
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {icon}
      {label}
    </div>
    <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginTop: 2 }}>{value}</p>
  </div>
);

/* ─── Component ────────────────────────────────────────────────────────────── */
const ClassWiseScore = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [open, setOpen] = useState(false);
  const [testSetResults, setTestSetResults] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedSetName, setSelectedSetName] = useState("");
  const [loadingResults, setLoadingResults] = useState(false);
  const [data, setData] = useState({ test_id: null, total_sets: 0, sets: [] });

  useEffect(() => { fetchData(); }, [testId]);

  const fetchData = async () => {
    try {
      const d = await setTestAPI.getSetTest(testId);
      setData(d);
      if (d.sets.length > 0 && !selectedSetId) {
        handleTestData(d.sets[0].set_id, d.sets[0].set_name);
      }
    } catch (err) { console.error("Failed to load score data", err); }
  };

  const handleTestData = async (testSetId, setName) => {
    try {
      setTestSetResults(null);
      setSelectedSetId(testSetId);
      setSelectedSetName(setName);
      setLoadingResults(true);
      const d = await scoreAPI.getTestSetResults(testSetId);
      setTestSetResults(d);
    } catch (err) {
      alert(`Error: ${err.message || "Failed to load results"}`);
      setSelectedSetId(null); setSelectedSetName(""); setTestSetResults(null);
    } finally { setLoadingResults(false); }
  };

  const handleDeleteSet = async (e, setId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this sub-test set?")) return;
    try {
      await setTestAPI.deleteSubTest(setId);
      if (selectedSetId === setId) { setTestSetResults(null); setSelectedSetId(null); }
      fetchData();
    } catch { alert("Failed to delete sub-test"); }
  };

  const examTypeMeta = (t) => ({
    TIMED: { label: 'Timed', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    FIXED_TIME: { label: 'Fixed', color: '#c084fc', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' },
    UNTIMED: { label: 'Untimed', color: C.accent, bg: C.accentFaint, border: C.borderAccent },
  }[t] || { label: t || '—', color: '#9ca3af', bg: 'rgba(255,255,255,0.05)', border: C.border });

  const stats = (() => {
    const r = testSetResults?.results || [];
    return {
      total: r.length,
      passed: r.filter(s => s.score !== null && s.score >= testSetResults?.pass_threshold).length,
      failed: r.filter(s => s.score !== null && s.score < testSetResults?.pass_threshold).length,
      notAttempted: r.filter(s => s.score === null).length,
    };
  })();

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, padding: '24px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14, padding: '16px 22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: C.accentFaint, border: `1px solid ${C.borderAccent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaClipboardList size={19} color={C.accent} />
            </div>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: C.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Test Analytics Dashboard
              </h1>
              <p style={{ fontSize: 12, color: C.textSub, margin: '3px 0 0', fontWeight: 500 }}>
                Monitor student performance across sub-sets
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              variant="ghost"
              icon={<FiDownload size={14} />}
              onClick={() => window.open(`${apiBase}/tests/download/${testId}`, "_blank")}
            >Questions PDF</Btn>
            <Btn
              variant="outline"
              icon={<FiDownload size={14} />}
              onClick={() => window.open(`${apiBase}/score/report/all-sets/${testId}`, "_blank")}
            >Full Report</Btn>
          </div>
        </div>

        {/* ── Main Two-Column Layout ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* ── LEFT: Set Navigator ──────────────────────────────────────── */}
          <div style={{
            width: 230, flexShrink: 0,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14, overflow: 'hidden'
          }}>
            {/* Panel header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <FiFileText size={14} color={C.accent} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sub-Sets</p>
                <p style={{ fontSize: 11, color: C.textSub, margin: 0 }}>{data.total_sets} available</p>
              </div>
            </div>

            {data.sets.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <FiFileText size={28} color={C.textSub} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, color: C.textSub }}>No sub-sets yet</p>
              </div>
            ) : (
              <div style={{ padding: 8 }}>
                {data.sets.map((set) => {
                  const isSelected = selectedSetId === set.set_id;
                  const meta = examTypeMeta(set.exam_type);
                  return (
                    <div
                      key={set.set_id}
                      onClick={() => handleTestData(set.set_id, set.set_name)}
                      style={{
                        borderRadius: 10, padding: '10px 12px', marginBottom: 4,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: isSelected ? C.accentFaint : 'transparent',
                        border: `1px solid ${isSelected ? C.borderAccent : 'transparent'}`,
                      }}
                    >
                      {/* Set title row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          {isSelected && <FiChevronRight size={13} color={C.accent} style={{ flexShrink: 0 }} />}
                          <span style={{
                            fontSize: 13, fontWeight: 700, color: isSelected ? C.accent : C.textPrimary,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>{set.set_name}</span>
                        </div>
                        <Tag color={meta.color} bg={meta.bg} border={meta.border}>
                          {meta.label.charAt(0)}
                        </Tag>
                      </div>

                      {/* Action row */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`${apiBase}/subtest/download/${set.set_id}`, "_blank"); }}
                          title="Download Questions"
                          style={{
                            flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                            color: C.textSub, cursor: 'pointer'
                          }}
                        >
                          <FiDownload size={10} /> Qns
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`${apiBase}/subtest/download-results/${set.set_id}`, "_blank"); }}
                          title="Download Results"
                          style={{
                            flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            background: C.accentFaint, border: `1px solid ${C.borderAccent}`,
                            color: C.accent, cursor: 'pointer'
                          }}
                        >
                          <FiDownload size={10} /> Res
                        </button>
                        <button
                          onClick={(e) => handleDeleteSet(e, set.set_id)}
                          title="Delete Set"
                          style={{
                            padding: '5px 7px', borderRadius: 6, fontSize: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', cursor: 'pointer', flexShrink: 0
                          }}
                        >
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Results Panel ──────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Loading */}
            {loadingResults && (
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '60px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14
              }}>
                <div style={{
                  width: 36, height: 36,
                  border: `3px solid ${C.border}`, borderTopColor: C.accent,
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>Loading results…</p>
              </div>
            )}

            {/* Results */}
            {testSetResults && !loadingResults && (
              <>
                {/* Results header row */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary, margin: 0 }}>
                        {selectedSetName}
                        <span style={{ color: C.textSub, fontWeight: 500, marginLeft: 6 }}>— Results</span>
                      </h2>
                      <p style={{ fontSize: 12, color: C.textSub, margin: '4px 0 0' }}>Student performance analysis</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Pass mark pill */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 14px', borderRadius: 8,
                        background: C.accentFaint, border: `1px solid ${C.borderAccent}`
                      }}>
                        <FiAward size={13} color={C.accent} />
                        <span style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>Pass mark:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>{testSetResults.pass_threshold} correct</span>
                      </div>

                      <Btn
                        variant="outline"
                        icon={<FiDownload size={13} />}
                        onClick={() => window.open(`${apiBase}/subtest/download-results/${selectedSetId}`, "_blank")}
                      >Download Report</Btn>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    <StatCard label="Total" value={stats.total} icon={<FiUsers size={13} />} color="#60a5fa" bgColor="rgba(59,130,246,0.08)" borderColor="rgba(59,130,246,0.18)" />
                    <StatCard label="Passed" value={stats.passed} icon={<FiCheckCircle size={13} />} color="#34d399" bgColor="rgba(52,211,153,0.08)" borderColor="rgba(52,211,153,0.18)" />
                    <StatCard label="Failed" value={stats.failed} icon={<FiXCircle size={13} />} color="#f87171" bgColor="rgba(248,113,113,0.08)" borderColor="rgba(248,113,113,0.18)" />
                    <StatCard label="Pending" value={stats.notAttempted} icon={<FiClock size={13} />} color="#fbbf24" bgColor="rgba(251,191,36,0.08)" borderColor="rgba(251,191,36,0.18)" />
                  </div>
                </div>

                {/* Table */}
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                        {[
                          { label: '#', w: 48, align: 'center' },
                          { label: 'Student', w: null, align: 'left' },
                          { label: 'Course / Unit', w: 140, align: 'center' },
                          { label: 'Score', w: 130, align: 'center' },
                          { label: 'Actions', w: 140, align: 'right' },
                        ].map(col => (
                          <th key={col.label} style={{
                            padding: '11px 16px',
                            textAlign: col.align,
                            width: col.w || undefined,
                            fontSize: 10, fontWeight: 800, letterSpacing: '0.07em',
                            textTransform: 'uppercase', color: C.textSub,
                          }}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {testSetResults.results?.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '56px 24px', textAlign: 'center' }}>
                            <FiUsers size={32} color={C.textSub} style={{ margin: '0 auto 10px', display: 'block' }} />
                            <p style={{ fontSize: 13, color: C.textSub }}>No students have attempted this set yet.</p>
                          </td>
                        </tr>
                      ) : (
                        testSetResults.results.map((student, idx) => {
                          const attempted = student.score !== null;
                          const passed = attempted && student.score >= testSetResults.pass_threshold;
                          const totalQ = student.total_questions ?? testSetResults.results[0]?.total_questions ?? '—';

                          return (
                            <tr
                              key={student.student_id}
                              style={{
                                borderBottom: `1px solid ${C.border}`,
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {/* # */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 26, height: 26, borderRadius: '50%',
                                  background: C.accentFaint, border: `1px solid ${C.borderAccent}`,
                                  fontSize: 11, fontWeight: 800, color: C.accent
                                }}>{idx + 1}</span>
                              </td>

                              {/* Student info */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{
                                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                    background: C.surfaceAlt, border: `1px solid ${C.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 900, color: C.accent
                                  }}>
                                    {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: 0 }}>{student.name}</p>
                                    <p style={{ fontSize: 11, fontWeight: 500, color: C.textSub, margin: '2px 0 0', fontFamily: 'monospace' }}>{student.army_no}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Course */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px', borderRadius: 6,
                                  background: C.accentFaint, border: `1px solid rgba(0,194,199,0.15)`,
                                  fontSize: 12, fontWeight: 700, color: C.textPrimary
                                }}>
                                  {student.course_no || '—'}
                                </span>
                                {student.unit && (
                                  <p style={{ fontSize: 10, color: C.textSub, margin: '3px 0 0' }}>{student.unit}</p>
                                )}
                              </td>

                              {/* Score */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {attempted ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                    <div style={{
                                      padding: '4px 12px', borderRadius: 7, fontWeight: 800, fontSize: 14,
                                      background: passed ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                                      color: passed ? '#34d399' : '#f87171',
                                      border: `1px solid ${passed ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                                    }}>
                                      {student.score}
                                      <span style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, marginLeft: 3 }}>/ {totalQ}</span>
                                    </div>
                                    <Tag
                                      color={passed ? '#34d399' : '#f87171'}
                                      bg={passed ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)'}
                                      border={passed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}
                                    >{passed ? '✓ PASS' : '✗ FAIL'}</Tag>
                                  </div>
                                ) : (
                                  <Tag color="#fbbf24" bg="rgba(251,191,36,0.08)" border="rgba(251,191,36,0.2)">
                                    <FiClock size={10} style={{ marginRight: 4 }} />Pending
                                  </Tag>
                                )}
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                  <Btn
                                    variant="ghost"
                                    icon={<FiDownload size={12} />}
                                    disabled={!attempted}
                                    onClick={() => window.open(`${apiBase}/score/download/${selectedSetId}/${student.student_id}`, "_blank")}
                                  >PDF</Btn>
                                  <Btn
                                    variant="outline"
                                    icon={<FiBarChart2 size={12} />}
                                    disabled={!attempted}
                                    onClick={() => navigate(`/review/${testSetResults.test_set_id}/${student.student_id}`)}
                                  >Review</Btn>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Empty state when nothing selected */}
            {!testSetResults && !loadingResults && data.sets.length > 0 && (
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '64px 24px', textAlign: 'center'
              }}>
                <FiBarChart2 size={36} color={C.textSub} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textSub }}>Select a sub-set to view results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && <CreateSubTestModal testId={testId} onClose={() => { setOpen(false); fetchData(); }} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClassWiseScore;