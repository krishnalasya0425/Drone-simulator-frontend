import React, { useState } from "react";
import { FaUpload, FaTimes, FaFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const UploadDocs = ({ classId, uploadDocs, onClose }) => {
  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
      setFile(droppedFile);
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg relative animate-fadeIn border"
        style={{
          backgroundColor: 'rgba(159, 207, 159, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(7, 79, 6, 0.3)',
          boxShadow: '0 20px 60px rgba(7, 79, 6, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#074F06' }}>
              <FaUpload className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#074F06' }}>
                Upload Document
              </h2>
              <p className="text-sm text-gray-600">Add a new file to this class</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-all"
            style={{ color: '#074F06' }}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mx-6 mb-4 p-4 rounded-lg flex items-center gap-3 ${messageType === 'success' ? 'bg-green-100' :
              messageType === 'error' ? 'bg-red-100' :
                'bg-blue-100'
              }`}
          >
            {messageType === 'success' && <FaCheckCircle className="text-green-600" size={20} />}
            {messageType === 'error' && <FaExclamationCircle className="text-red-600" size={20} />}
            {messageType === 'info' && <FaFileAlt className="text-blue-600" size={20} />}
            <p className={`font-medium ${messageType === 'success' ? 'text-green-800' :
              messageType === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">

          {/* Document Title */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: '#074F06' }}>
              Document Title *
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all bg-white"
              style={{ borderColor: '#074F06' }}
              placeholder="Enter a descriptive title..."
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(7, 79, 6, 0.1)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* File Upload - Drag & Drop Area */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: '#074F06' }}>
              Select File *
            </label>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
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
                  <FaUpload className="mx-auto mb-3" size={40} style={{ color: '#074F06' }} />
                  <p className="font-semibold mb-1" style={{ color: '#074F06' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, Images, Videos
                  </p>
                </div>
              ) : (
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <FaFileAlt className="mx-auto mb-2" size={32} style={{ color: '#074F06' }} />
                  <p className="font-semibold text-gray-800 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-600">{getFileSize(file.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !docTitle}
              className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#074F06' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#053d05')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#074F06')}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload size={18} />
                  Upload Document
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
