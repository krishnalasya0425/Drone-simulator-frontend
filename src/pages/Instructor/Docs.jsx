import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import classAPI from "../../entities/class";
import Modal from "../../components/FileModal";
import UploadDocs from './UploadDocs'

import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFile,
} from "react-icons/fa";

const Docs = () => {
  const { classId } = useParams();
  const [docs, setDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [classData, setClassData] = useState({});
  const [docType, setDocType] = useState(null);


  const [preview, setPreview] = useState(null);
  const [uploadDoc, setUploadDoc] = useState(false);
  const [openSection, setOpenSection] = useState(null);
    const [previewId, setPreviewId] = useState(null);

  // -----------------------
  // Load Class & Docs
  // -----------------------
  const loadDocs = async () => {
    try {
        const classInfo = await classAPI.getClassInfo(classId);
      setClassData(classInfo);
    
      const res = await classAPI.getDocs(classId);
      setDocs(res.docs);

    
    } catch (err) {
      console.error("Failed to load docs", err.message);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [classId]);

  console.log(docs)

  // -----------------------
  // File Icons
  // -----------------------
 const getFileIcon = (mime) => {
    if (!mime) return <FaFile size={30} />;

    if (mime.includes("pdf")) return <FaFilePdf size={30} color="red" />;
    // if (mime.includes("word")) return <FaFileWord size={30} color="blue" />;
    // if (mime.includes("spreadsheet") || mime.includes("excel"))
    //   return <FaFileExcel size={30} color="green" />;
    // if (mime.includes("presentation"))
    //   return <FaFilePowerpoint size={30} color="orange" />;
    if (mime.startsWith("image")) return <FaFileImage size={30} />;

    return <FaFile size={30} />;
  };

  // -----------------------
  // Group Files by Type
  // -----------------------
 

  return (
    <div className="p-4">

      {/* ---------------- CLASS INFO ---------------- */}
      <div className="bg-white border rounded-lg shadow p-4 mb-6">
        <h2 className="text-2xl font-bold mb-2">{classData.class_name}</h2>

        <div className="flex gap-6 flex-wrap">
          <p><strong>Class ID:</strong> {classData.id}</p>
          <p><strong>Created By:</strong> {classData.creator_id} — {classData.created_by}</p>
          <p><strong>Created At:</strong> {classData.created_at ? new Date(classData.created_at).toLocaleString() : ""}</p>
        </div>
      </div>
  <div className="grid grid-cols-2 gap-4 p-4">
      {docs.map((doc) => (
      <div
  key={doc.id}
  className="p-3 rounded border cursor-pointer hover:bg-gray-100 flex items-center gap-3"
  onClick={() => {
    if (doc.file_type.includes("pdf") || doc.file_type.startsWith("image")) {
      setPreviewId(doc.id);
      setDocType(doc.file_type);
    } 
  }}
>
  {getFileIcon(doc.file_type)}
  <span className="font-medium">{doc.doc_title}</span>
</div>
      ))}

      {previewId && (
        <Modal fileId={previewId} docType ={docType} onClose={() => setPreviewId(null)} />
      )}
    </div>
      {/* ------------------------ Upload Button ------------------------ */}
      <button
        onClick={() => setUploadDoc(true)}
        className="fixed bottom-4 right-4 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700"
      >
        Upload Docs
      </button>

     
      {/* ------------------------ UPLOAD MODAL ------------------------ */}
      {uploadDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-[400px] relative">

            <button
              className="absolute top-2 right-2 text-xl bg-gray-200 px-3 py-1 rounded"
              onClick={() => setUploadDoc(false)}
            >
              ✖
            </button>

            <UploadDocs classId={classId} uploadDocs={classAPI.uploadDocs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Docs;
