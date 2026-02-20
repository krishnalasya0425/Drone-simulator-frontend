import React, { useState, useEffect } from "react";
import test from "../entities/test.jsx";
import { classAPI } from "../entities/class";
import { useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiList,
  FiClock,
  FiActivity,
  FiLayers,
  FiX
} from "react-icons/fi";
import { FaClipboardList, FaFilePdf, FaLayerGroup, FaRandom } from "react-icons/fa";

// ─── Shared design tokens ─────────────────────────────────────────────────────
const T = {
  bg: '#061E29',
  panel: 'rgba(10,37,51,0.6)',
  border: 'rgba(0,194,199,0.18)',
  accent: '#00C2C7',
  accentDim: 'rgba(0,194,199,0.1)',
  text: '#F3F4F4',
  textMuted: 'rgba(243,244,244,0.45)',
  textSub: 'rgba(0,194,199,0.55)',
  inputBg: 'rgba(0,194,199,0.07)',
};

const PanelStyle = {
  background: T.panel,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${T.border}`,
  borderRadius: 16,
};

const InputStyle = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.inputBg,
  color: T.text,
  outline: 'none',
  fontSize: 14,
  fontWeight: 500,
  transition: 'border-color 0.2s',
};

export default function TestMaker() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [title, setTitle] = useState("");
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [questionsPerSet, setQuestionsPerSet] = useState(10);
  const [questionBankFile, setQuestionBankFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [examConfig, setExamConfig] = useState({
    examType: "UNTIMED",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    passThreshold: 5
  });
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  useEffect(() => {
    if (role === "Instructor" || role === "admin") loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classAPI.getAllClasses(userId);
      setClasses(data);
    } catch (err) { console.error("Failed to load classes", err); }
  };

  const handleQuestionBankChange = (file) => setQuestionBankFile(file);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedClassId) { alert("Please provide Test Name and Select a Class."); return; }
    if (!questionBankFile) { alert("Please upload a Question Bank PDF file."); return; }
    if (examConfig.examType === 'TIMED' && !examConfig.durationMinutes) { alert("Please specify duration for TIMED exam."); return; }
    if (numberOfSets < 1 || questionsPerSet < 1) { alert("Number of sets and questions per set must be at least 1."); return; }

    setUploading(true);
    try {
      const res = await test.addTest(title, userId, selectedClassId);
      const newTestId = res.testId;
      const formData = new FormData();
      formData.append('questionBank', questionBankFile);
      formData.append('numberOfSets', numberOfSets);
      formData.append('questionsPerSet', questionsPerSet);
      formData.append('examType', examConfig.examType);
      formData.append('passThreshold', examConfig.passThreshold);
      formData.append('classId', selectedClassId);
      if (examConfig.durationMinutes) formData.append('durationMinutes', examConfig.durationMinutes);
      if (examConfig.startTime) formData.append('startTime', examConfig.startTime);
      if (examConfig.endTime) formData.append('endTime', examConfig.endTime);
      const result = await test.generateSetsFromQuestionBank(newTestId, formData);
      alert(`✅ Success! Created ${result.numberOfSets} sets with ${result.questionsPerSet} questions each from a bank of ${result.totalQuestions} questions!`);
      navigate(`/${selectedClassId}/docs`);
    } catch (error) {
      const errorMsg = error.message || "Unknown error";
      if (errorMsg.includes("No questions found") || errorMsg.includes("Failed to parse PDF") || errorMsg.includes("corrupted") || errorMsg.includes("Failed to extract text")) {
        setShowFormatModal(true);
      } else {
        alert("Failed to create test sets: " + errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: T.bg }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: T.accentDim,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaRandom size={24} color={T.accent} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ letterSpacing: '-0.5px' }}>
              Test Maker — Question Bank
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: T.textSub }}>
              Upload one PDF · Randomly distributed across multiple sets
            </p>
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <div style={{ ...PanelStyle, padding: '1.25rem 1.5rem', marginBottom: 16 }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{
              width: 32, height: 32,
              background: T.accentDim,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiLayers size={16} color={T.accent} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wide">How It Works</h2>
              <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Simple 3-step process to create randomized test sets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { n: '1', title: 'Upload Question Bank', desc: 'One PDF with all your questions (e.g., 50 questions)' },
              { n: '2', title: 'Configure Sets', desc: 'Specify how many sets and questions per set (e.g., 5 sets × 10 questions)' },
              { n: '3', title: 'Random Distribution', desc: 'Questions randomly distributed to sets, sets randomly assigned to students' },
            ].map(step => (
              <div key={step.n} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${T.border}`,
                borderRadius: 12, padding: '0.9rem 1rem'
              }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: T.accentDim,
                    border: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, color: T.accent, flexShrink: 0
                  }}>{step.n}</div>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-xs pl-9" style={{ color: T.textMuted }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PDF Format Guide ─────────────────────────────────────────────── */}
        <div style={{ ...PanelStyle, padding: '1.25rem 1.5rem', marginBottom: 20 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{
                width: 32, height: 32,
                background: T.accentDim,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiFileText size={16} color={T.accent} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">PDF Format Requirements</h2>
                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Your PDF must follow this exact format</p>
              </div>
            </div>
            <button
              onClick={() => setShowFormatGuide(!showFormatGuide)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 9,
                border: `1px solid ${T.border}`,
                background: T.accentDim,
                color: T.accent,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {showFormatGuide ? 'Hide' : 'Show Example'}
            </button>
          </div>

          {showFormatGuide && (
            <div style={{
              marginTop: 16,
              background: 'rgba(0,194,199,0.04)',
              border: `1px solid ${T.border}`,
              borderRadius: 12, padding: '1rem 1.25rem'
            }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: T.accent }}>
                <FiCheckCircle size={14} /> Correct Format Example
              </h3>
              <div className="font-mono text-sm space-y-2 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
                <div><span className="font-bold" style={{ color: T.accent }}>1.</span> <span style={{ color: T.text }}>What is the capital of France?</span></div>
                <div className="ml-5 space-y-0.5">
                  {['A. London', 'B. Paris', 'C. Berlin', 'D. Madrid'].map(o => (
                    <div key={o}><span className="font-bold" style={{ color: 'rgba(96,165,250,0.9)' }}>{o.charAt(0)}.</span> <span style={{ color: T.textMuted }}>{o.slice(3)}</span></div>
                  ))}
                </div>
                <div className="ml-5"><span className="font-bold" style={{ color: '#34d399' }}>Answer:</span> <span style={{ color: T.text }}>B</span></div>
              </div>
              <ul className="mt-3 text-xs space-y-1" style={{ color: T.textMuted }}>
                <li>• Start each question with a number followed by a period (1., 2., 3...)</li>
                <li>• Options must start with A., B., C., or D.</li>
                <li>• Each answer must start with "Answer:" on its own line</li>
                <li>• PDF must contain selectable text (not scanned images)</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        {role !== "Instructor" && role !== "admin" ? (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 12,
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            color: '#f87171',
            fontSize: 14, fontWeight: 600
          }}>
            ⛔ Access Denied. Only Instructors can create tests.
          </div>
        ) : (
          <div style={{ ...PanelStyle, padding: '1.75rem' }}>
            <div className="space-y-6">

              {/* Test Name + Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    <FiFileText size={13} /> Test Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Map Reading Mid-Term"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={InputStyle}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    <FiList size={13} /> Select Class *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    style={{ ...InputStyle }}
                  >
                    <option value="" style={{ background: '#0a2533' }}>-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0a2533' }}>{c.class_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ height: 1, background: T.border }} />

              {/* Question Bank Upload */}
              <div style={{
                padding: '1.25rem',
                borderRadius: 12,
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.2)'
              }}>
                <label className="flex items-center gap-2 text-sm font-black mb-1" style={{ color: '#c084fc' }}>
                  <FaFilePdf size={18} /> Upload Question Bank PDF *
                </label>
                <p className="text-xs mb-3" style={{ color: 'rgba(192,132,252,0.55)' }}>
                  Upload a single PDF containing all your questions.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleQuestionBankChange(e.target.files[0])}
                  style={{
                    display: 'block', width: '100%', fontSize: 13,
                    color: T.textMuted,
                  }}
                  className="file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:cursor-pointer"
                  style2={{ accentColor: T.accent }}
                />
                {questionBankFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold" style={{ color: '#34d399' }}>
                    <FiCheckCircle size={16} />
                    {questionBankFile.name}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: T.border }} />

              {/* Set Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    <FaLayerGroup size={13} /> Number of Sets *
                  </label>
                  <input
                    type="number" min="1" max="26"
                    value={numberOfSets}
                    onChange={e => { const v = parseInt(e.target.value); if (v > 0 && v <= 26) setNumberOfSets(v); }}
                    style={{ ...InputStyle, fontWeight: 800, fontSize: 16 }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                  <p className="text-xs mt-1" style={{ color: T.textMuted }}>How many different test variations (Set A, B, C...)</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    <FiList size={13} /> Questions Per Set *
                  </label>
                  <input
                    type="number" min="1"
                    value={questionsPerSet}
                    onChange={e => { const v = parseInt(e.target.value); if (v > 0) setQuestionsPerSet(v); }}
                    style={{ ...InputStyle, fontWeight: 800, fontSize: 16 }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                  <p className="text-xs mt-1" style={{ color: T.textMuted }}>How many questions each student will receive</p>
                </div>
              </div>

              {/* Config Summary */}
              <div style={{
                padding: '0.9rem 1.1rem',
                borderRadius: 10,
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.2)'
              }}>
                <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(96,165,250,0.8)' }}>
                  <FiActivity size={16} className="mt-0.5 flex-shrink-0" />
                  <ul className="space-y-0.5 text-xs" style={{ color: T.textMuted }}>
                    <li>• <strong style={{ color: T.accent }}>{numberOfSets} different test sets</strong> will be created</li>
                    <li>• Each set will have <strong style={{ color: T.accent }}>{questionsPerSet} questions</strong></li>
                    <li>• Questions will be <strong style={{ color: T.accent }}>randomly selected</strong> from your question bank</li>
                    <li>• Sets will be <strong style={{ color: T.accent }}>randomly assigned</strong> to students</li>
                  </ul>
                </div>
              </div>

              <div style={{ height: 1, background: T.border }} />

              {/* Exam Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    Exam Type
                  </label>
                  <select
                    value={examConfig.examType}
                    onChange={e => setExamConfig({ ...examConfig, examType: e.target.value })}
                    style={InputStyle}
                  >
                    <option value="UNTIMED" style={{ background: '#0a2533' }}>Untimed (Practice)</option>
                    <option value="TIMED" style={{ background: '#0a2533' }}>Timed (Duration)</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.accent }}>
                    <FiCheckCircle size={13} /> Pass Threshold (Questions)
                  </label>
                  <input
                    type="number" min="1"
                    value={examConfig.passThreshold}
                    onChange={e => { const v = parseInt(e.target.value) || 1; setExamConfig({ ...examConfig, passThreshold: v >= 1 ? v : 1 }); }}
                    style={{ ...InputStyle, fontWeight: 800, fontSize: 16 }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>

              {examConfig.examType === 'TIMED' && (
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 10,
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <FiClock size={20} color="rgba(96,165,250,0.8)" />
                  <div style={{ flex: 1 }}>
                    <label className="text-xs font-black uppercase tracking-widest block mb-1" style={{ color: 'rgba(96,165,250,0.7)' }}>Duration (Minutes)</label>
                    <input
                      type="number" min="1"
                      value={examConfig.durationMinutes}
                      onChange={e => { const v = parseInt(e.target.value) || 1; setExamConfig({ ...examConfig, durationMinutes: v >= 1 ? v : 1 }); }}
                      style={{ ...InputStyle, width: 'auto', minWidth: 100 }}
                    />
                  </div>
                </div>
              )}

              {examConfig.examType === 'FIXED_TIME' && (
                <div className="grid grid-cols-2 gap-4" style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 10,
                  background: 'rgba(168,85,247,0.06)',
                  border: '1px solid rgba(168,85,247,0.2)'
                }}>
                  {['startTime', 'endTime'].map(field => (
                    <div key={field}>
                      <label className="text-xs font-black uppercase tracking-widest block mb-1" style={{ color: 'rgba(192,132,252,0.7)' }}>
                        {field === 'startTime' ? 'Start Time' : 'End Time'}
                      </label>
                      <input
                        type="datetime-local"
                        value={examConfig[field]}
                        onChange={e => setExamConfig({ ...examConfig, [field]: e.target.value })}
                        style={{ ...InputStyle, border: '1px solid rgba(168,85,247,0.25)' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.5rem',
                  borderRadius: 12,
                  fontWeight: 900,
                  fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  border: `1px solid ${T.accent}`,
                  background: T.accentDim,
                  color: T.accent,
                  opacity: uploading ? 0.65 : 1,
                  transition: 'all 0.2s',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                {uploading ? (
                  <>
                    <div style={{
                      width: 18, height: 18,
                      border: `2px solid ${T.border}`,
                      borderTopColor: T.accent,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating Test Sets...
                  </>
                ) : (
                  <>
                    <FiUpload size={20} />
                    Create Test Sets from Question Bank
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* ── Format Error Modal ──────────────────────────────────────────── */}
        {showFormatModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem'
          }}>
            <div style={{
              background: '#0a1f2b',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 20,
              maxWidth: 560, width: '100%',
              maxHeight: '90vh', overflowY: 'auto'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(248,113,113,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 38, height: 38,
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FiActivity size={18} color="#f87171" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Invalid PDF Format</h2>
                    <p className="text-xs" style={{ color: 'rgba(248,113,113,0.6)' }}>Your PDF doesn't match the required format</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFormatModal(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: T.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div style={{
                  padding: '1rem',
                  borderRadius: 12,
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)'
                }}>
                  <h3 className="text-sm font-black mb-2" style={{ color: '#f87171' }}>What went wrong?</h3>
                  <p className="text-xs mb-2" style={{ color: 'rgba(248,113,113,0.65)' }}>
                    We couldn't find any valid questions in your PDF. Common causes:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1" style={{ color: T.textMuted }}>
                    <li>The PDF format doesn't match our requirements</li>
                    <li>The PDF is a scanned image (text must be selectable)</li>
                    <li>Questions not numbered correctly (must use 1., 2., 3...)</li>
                    <li>Options don't start with A., B., C., D.</li>
                    <li>Answer lines missing or incorrectly formatted</li>
                  </ul>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: 12,
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.2)'
                }}>
                  <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: '#34d399' }}>
                    <FiCheckCircle size={14} /> Required Format
                  </h3>
                  <div className="font-mono text-xs space-y-1 p-3 rounded-lg" style={{ background: 'rgba(0,194,199,0.05)', border: `1px solid ${T.border}` }}>
                    <div><span className="font-bold" style={{ color: '#34d399' }}>1.</span> <span style={{ color: T.text }}>Your question text here?</span></div>
                    {['A', 'B', 'C', 'D'].map(l => (
                      <div key={l} className="ml-4"><span className="font-bold" style={{ color: '#60a5fa' }}>{l}.</span> <span style={{ color: T.textMuted }}>Option text</span></div>
                    ))}
                    <div className="ml-4"><span className="font-bold" style={{ color: '#a78bfa' }}>Answer:</span> <span style={{ color: T.text }}>A</span></div>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setShowFormatModal(false); setShowFormatGuide(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 10,
                      border: `1px solid ${T.border}`,
                      background: T.accentDim,
                      color: T.accent,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <FiFileText size={14} /> View Format Guide
                  </button>
                  <button
                    onClick={() => setShowFormatModal(false)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: T.textMuted,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
