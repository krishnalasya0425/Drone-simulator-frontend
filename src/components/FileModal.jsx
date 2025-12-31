

import React from "react";

const FileModal = ({ fileId, docType, onClose }) => {
  const fileURL = `http://localhost:5000/classes/docs/file/${fileId}`;

  const isPDF = docType.includes("pdf");
  const isImage = docType.startsWith("image");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <button
        className="absolute top-5 right-5 bg-gray-600 text-white px-4 py-1 rounded z-50"
        onClick={onClose}
      >
        ✕
      </button>

      {/* PDF VIEW */}
      {isPDF && (
        <iframe
          src={fileURL}
          className="w-full h-screen rounded shadow-xl"
          style={{ backgroundColor: '#9FCF9F' }}
        ></iframe>
      )}

      {/* IMAGE VIEW */}
      {isImage && (
        <img
          src={fileURL}
          alt="preview"
          className="max-w-[90%] max-h-[90%] rounded shadow-xl"
        />
      )}
    </div>
  );
};

export default FileModal;
