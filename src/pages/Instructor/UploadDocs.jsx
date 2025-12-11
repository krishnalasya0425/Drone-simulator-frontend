import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { classAPI } from "../../entities/class";

const UploadDocs = ({ classId, uploadDocs }) => {

 
 
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

      await uploadDocs(classId,  docTitle, file);

      setMessage("✅ File uploaded successfully!");
      setFile(null);
      setDocTitle("");
    } catch (err) {
      console.error(err.message);
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg border">

      <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Document</h2>
   

      {message && <p className="mb-3 text-center font-medium">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">


        {/* Doc Title */}
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Document Title</label>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter document title"
          />
        </div>

        {/* File Upload */}
       <div>
  <label className="block text-gray-600 mb-1 font-medium">
    Select File
  </label>

  <input
    type="file"
    accept="application/pdf, image/*"
    onChange={handleFileSelect}
    className="w-full border rounded px-3 py-2"
  />

  {file && (
    <p className="mt-2 text-sm text-gray-600">
      Selected: {file.name}
    </p>
  )}
</div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  );
};

export default UploadDocs;
