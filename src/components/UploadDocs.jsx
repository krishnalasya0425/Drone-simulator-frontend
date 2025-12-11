import React, { useState } from "react";

const UploadDocs = ({ classId, uploadDocs, onClose }) => {
  const [docTitle, setDocTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !docTitle) {
      setMessage("❌ Title and File are required");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading...");

      await uploadDocs(classId, docTitle, file);

      setMessage("✅ File uploaded successfully!");
      setFile(null);
      setDocTitle("");

      setTimeout(() => onClose(), 1000); // close modal after upload
    } catch (err) {
      setMessage("❌ Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[420px] relative animate-fadeIn">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-xl px-3 py-1 rounded"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Document</h2>

        {message && <p className="mb-3 text-center font-medium">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter document title"
            />
          </div>

          {/* File */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Select File
            </label>

            <input
              type="file"
              accept="application/pdf, image/*, video/*"
              onChange={handleFileSelect}
              className="w-full border rounded px-3 py-2"
            />

            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocs;
