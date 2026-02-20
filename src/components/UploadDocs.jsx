import React, { useState } from "react";
import { FaUpload, FaTimes, FaFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FiUploadCloud, FiX, FiFile } from "react-icons/fi";

/* ─── Palette ──────────────────────────────────────────────────────────────── */
const T = {
  bg: '#07202d',
  surface: '#0c2a38',
  surfaceAlt: '#0f3347',
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(0,194,199,0.3)',
  accent: '#00C2C7',
  accentFaint: 'rgba(0,194,199,0.09)',
  text: '#e8eaeb',
  textMuted: 'rgba(232,234,235,0.45)',
  green: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
};

const UploadDocs = ({ classId, uploadDocs, onClose }) => {
  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error | info
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const FILE_SIZE_LIMITS = {
    'application/pdf': 30 * 1024 * 1024,
    'image': 5 * 1024 * 1024,
    'video': 100 * 1024 * 1024,
  };

  const validateFileSize = (file) => {
    const t = file.type;
    let maxSize, label;
    if (t === 'application/pdf') { maxSize = FILE_SIZE_LIMITS['application/pdf']; label = 'PDF'; }
    else if (t.startsWith('image/')) { maxSize = FILE_SIZE_LIMITS['image']; label = 'Image'; }
    else if (t.startsWith('video/')) { maxSize = FILE_SIZE_LIMITS['video']; label = 'Video'; }
    else return { valid: false, message: 'Unsupported file type' };
    if (file.size > maxSize) return { valid: false, message: `${label} exceeds ${getFileSize(maxSize)}. Your file is ${getFileSize(file.size)}.` };
    return { valid: true };
  };

  const processFile = (f) => {
    const v = validateFileSize(f);
    if (!v.valid) { setMessage(v.message); setMessageType("error"); setFile(null); return; }
    setFile(f);
    setMessage("");
    if (!docTitle) setDocTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleFileSelect = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !docTitle) { setMessage("Title and file are required."); setMessageType("error"); return; }
    try {
      setLoading(true);
      setMessage("Uploading asset…"); setMessageType("info");
      await uploadDocs(classId, docTitle, file);
      setMessage("Asset uploaded successfully!"); setMessageType("success");
      setFile(null); setDocTitle("");
      setTimeout(() => onClose(), 1500);
    } catch {
      setMessage("Upload failed. Please try again."); setMessageType("error");
    } finally { setLoading(false); }
  };

  const getFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / k ** i * 100) / 100} ${s[i]}`;
  };

  const msgColor = { success: T.green, error: T.red, info: T.accent }[messageType] || T.textMuted;
  const msgBg = { success: 'rgba(52,211,153,0.08)', error: 'rgba(248,113,113,0.08)', info: T.accentFaint }[messageType] || 'transparent';
  const msgBorder = { success: 'rgba(52,211,153,0.2)', error: 'rgba(248,113,113,0.2)', info: T.borderAccent }[messageType] || T.border;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(6,30,41,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: T.surface,
        border: `1px solid ${T.borderAccent}`,
        borderRadius: 16, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: T.accentFaint, border: `1px solid ${T.borderAccent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiUploadCloud size={18} color={T.accent} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Upload Asset</h2>
              <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Add file to class</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 7, border: `1px solid ${T.border}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.textMuted, transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted; }}
          ><FiX size={16} /></button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            margin: '12px 20px 0',
            padding: '10px 14px', borderRadius: 9,
            background: msgBg, border: `1px solid ${msgBorder}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 600, color: msgColor
          }}>
            {messageType === 'success' && <FaCheckCircle size={13} />}
            {messageType === 'error' && <FaExclamationCircle size={13} />}
            {messageType === 'info' && <FiUploadCloud size={13} />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Document Title */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
              Document Title <span style={{ color: T.red }}>*</span>
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="Enter document title…"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 9,
                background: T.bg, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 13, fontWeight: 500, outline: 'none',
                transition: 'border-color 0.15s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = T.borderAccent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          {/* File Drop Zone */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
              Select File <span style={{ color: T.red }}>*</span>
            </label>
            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag}
              onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => document.getElementById('upload-file-input').click()}
              style={{
                border: `2px dashed ${dragActive ? T.accent : (file ? T.borderAccent : T.border)}`,
                borderRadius: 11, padding: '20px 16px', textAlign: 'center',
                cursor: 'pointer', background: dragActive ? T.accentFaint : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              <input id="upload-file-input" type="file" accept="application/pdf, image/*, video/*" onChange={handleFileSelect} style={{ display: 'none' }} />

              {!file ? (
                <>
                  <FiUploadCloud size={28} color={dragActive ? T.accent : T.textMuted} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
                    {dragActive ? 'Drop to upload' : 'Click or drag file here'}
                  </p>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: '0 0 12px' }}>PDF, Images, Videos</p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '5px 12px', borderRadius: 7,
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`
                  }}>
                    {[['PDF', '30MB'], ['IMG', '5MB'], ['VID', '100MB']].map(([label, size], i) => (
                      <React.Fragment key={label}>
                        {i > 0 && <span style={{ width: 1, height: 12, background: T.border, display: 'inline-block' }} />}
                        <span style={{ fontSize: 10, color: T.textMuted }}>
                          <span style={{ fontWeight: 700, color: T.textMuted }}>{label}:</span>{' '}
                          <span style={{ color: T.text, fontWeight: 800 }}>{size}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '10px 14px', borderRadius: 9,
                  background: T.accentFaint, border: `1px solid ${T.borderAccent}`,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <FiFile size={20} color={T.accent} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>{getFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: T.red, flexShrink: 0
                    }}
                  >Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.textMuted
              }}
            >Cancel</button>
            <button
              type="submit"
              disabled={loading || !file || !docTitle}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: loading || !file || !docTitle ? 'not-allowed' : 'pointer',
                background: loading || !file || !docTitle ? 'rgba(255,255,255,0.04)' : T.accentFaint,
                border: `1px solid ${loading || !file || !docTitle ? T.border : T.borderAccent}`,
                color: loading || !file || !docTitle ? T.textMuted : T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                opacity: loading || !file || !docTitle ? 0.5 : 1,
                transition: 'all 0.15s'
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: `2px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Uploading…
                </>
              ) : (
                <><FaUpload size={13} /> Upload</>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default UploadDocs;
