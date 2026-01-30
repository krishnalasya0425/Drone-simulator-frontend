import React, { useState } from "react";
import { FaUpload, FaTimes, FaFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const UploadDocs = ({ classId, uploadDocs, onClose }) => {
  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // File size limits in bytes
  const FILE_SIZE_LIMITS = {
    'application/pdf': 30 * 1024 * 1024, // 30 MB
    'image': 5 * 1024 * 1024, // 5 MB
    'video': 100 * 1024 * 1024 // 100 MB
  };

  const validateFileSize = (file) => {
    const fileType = file.type;
    let maxSize;
    let fileTypeLabel;

    if (fileType === 'application/pdf') {
      maxSize = FILE_SIZE_LIMITS['application/pdf'];
      fileTypeLabel = 'PDF';
    } else if (fileType.startsWith('image/')) {
      maxSize = FILE_SIZE_LIMITS['image'];
      fileTypeLabel = 'Image';
    } else if (fileType.startsWith('video/')) {
      maxSize = FILE_SIZE_LIMITS['video'];
      fileTypeLabel = 'Video';
    } else {
      return { valid: false, message: 'Unsupported file type' };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: `${fileTypeLabel} file size exceeds the maximum limit of ${getFileSize(maxSize)}. Your file is ${getFileSize(file.size)}.`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validation = validateFileSize(selectedFile);

      if (!validation.valid) {
        setMessage(validation.message);
        setMessageType("error");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage(""); // Clear any previous error messages
      if (!docTitle) {
        setDocTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Auto-fill title from filename
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFileSize(droppedFile);

      if (!validation.valid) {
        setMessage(validation.message);
        setMessageType("error");
        setFile(null);
        return;
      }

      setFile(droppedFile);
      setMessage(""); // Clear any previous error messages
      if (!docTitle) {
        setDocTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !docTitle) {
      setMessage("Title and File are required");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading your document...");
      setMessageType("info");

      await uploadDocs(classId, docTitle, file);

      setMessage("File uploaded successfully!");
      setMessageType("success");
      setFile(null);
      setDocTitle("");

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setMessage("Upload failed. Please try again.");
      setMessageType("error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="rounded-xl shadow-2xl w-full max-w-md relative animate-fadeIn"
        style={{
          backgroundColor: 'white',
          border: '1px solid rgba(7, 79, 6, 0.2)',
        }}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FaUpload className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#074F06' }}>
                Upload
              </h2>
              <p className="text-xs text-gray-500">Add file to class</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: '#074F06' }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Compact Message Alert */}
        {message && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg flex items-center gap-2.5 text-sm ${messageType === 'success' ? 'bg-green-50 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}
          >
            {messageType === 'success' && <FaCheckCircle className="text-green-600 flex-shrink-0" size={16} />}
            {messageType === 'error' && <FaExclamationCircle className="text-red-600 flex-shrink-0" size={16} />}
            {messageType === 'info' && <FaFileAlt className="text-blue-600 flex-shrink-0" size={16} />}
            <p className={`font-medium ${messageType === 'success' ? 'text-green-800' :
              messageType === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Compact Document Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#074F06' }}>
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 rounded-lg outline-none transition-all bg-white"
              style={{ borderColor: '#D5F2D5' }}
              placeholder="Enter title..."
              onFocus={(e) => {
                e.target.style.borderColor = '#074F06';
                e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D5F2D5';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Compact File Upload Area */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#074F06' }}>
              Select File <span className="text-red-500">*</span>
            </label>

            <div
              className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 bg-gray-50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf, image/*, video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!file ? (
                <div>
                  <FaUpload className="mx-auto mb-2" size={28} style={{ color: '#074F06' }} />
                  <p className="text-sm font-semibold mb-1" style={{ color: '#074F06' }}>
                    Click or drag file here
                  </p>
                  <p className="text-xs text-gray-500 mb-2.5">
                    PDF, Images, Videos
                  </p>
                  {/* Compact Size Limits */}
                  <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-gray-500">PDF:</span>
                      <span className="text-[10px] font-bold text-gray-700">30MB</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-gray-500">IMG:</span>
                      <span className="text-[10px] font-bold text-gray-700">5MB</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-gray-500">VID:</span>
                      <span className="text-[10px] font-bold text-gray-700">100MB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <FaFileAlt className="mx-auto mb-2" size={24} style={{ color: '#074F06' }} />
                  <p className="font-semibold text-sm text-gray-800 mb-0.5 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600 mb-2">{getFileSize(file.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !docTitle}
              className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: loading || !file || !docTitle ? '#9CA3AF' : '#074F06' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload size={14} />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocs;
