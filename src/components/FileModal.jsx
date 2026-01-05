

import React from "react";

const FileModal = ({ fileId, docType, onClose }) => {
  const fileURL = `http://localhost:5000/classes/docs/file/${fileId}`;

  const isPDF = docType.includes("pdf");
  const isImage = docType.startsWith("image");
  const isVideo = docType.startsWith("video");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <button
        className="absolute top-5 right-5 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-red-700 transition-colors z-[60]"
        onClick={onClose}
      >
        ✕
      </button>

      <div className="w-full h-full flex items-center justify-center">
        {/* PDF VIEW */}
        {isPDF && (
          <iframe
            src={fileURL}
            className="w-full h-full rounded shadow-2xl"
            style={{ backgroundColor: '#9FCF9F' }}
          ></iframe>
        )}

        {/* IMAGE VIEW */}
        {isImage && (
          <img
            src={fileURL}
            alt="preview"
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
          />
        )}

        {/* VIDEO VIEW */}
        {isVideo && (
          <video
            src={fileURL}
            controls
            autoPlay
            className="max-w-full max-h-full rounded shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};

export default FileModal;
