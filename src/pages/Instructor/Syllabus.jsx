

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { classAPI } from "../../entities/class";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

import {
  FaRegImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileWord,
  FaFile
} from "react-icons/fa";

import UploadDocs from "./UploadDocs";

const SyllabusPage = () => {
  const { classId } = useParams();

  const [syllabus, setSyllabus] = useState([]);
  const [addSyllabusName, setAddSyllabusName] = useState("");
  const [docs, setDocs] = useState([])

  const [editMode, setEditMode] = useState(null); // syllabus ID
  const [editName, setEditName] = useState("");
  const [selelctedSyllabusId, setSelectedSyllabusId] = useState(null);
  const [selelctedSubSyllabusId, setSelectedSubSyllabusId] = useState(null);
  const [uploadDoc, setUploadDoc] = useState(false);

  const [expanded, setExpanded] = useState({}); // toggle sub-syllabus view


  const loadSyllabus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/classes/syllabus`);
      const docs1 = await classAPI.getDocs(1);

      setDocs(docs1.docs)
      const data = await res.json();
      setSyllabus(data);
    } catch (err) {
      console.error("Failed to load syllabus", err);
    }
  };

  useEffect(() => {
    loadSyllabus();

  }, [classId]);

  console.log("Syllabus Data:", syllabus);

  // ============ SYLLABUS CRUD ============
  const handleAddSyllabus = async () => {
    if (!addSyllabusName.trim()) return;
    await classAPI.addSyllabus(addSyllabusName, classId);
    setAddSyllabusName("");
    loadSyllabus();
  };

  const handleUpdateSyllabus = async (id) => {
    await classAPI.updateSyllabus(id, editName);
    setEditMode(null);
    loadSyllabus();
  };

  const handleDeleteSyllabus = async (id) => {
    await classAPI.deleteSyllabus(id);
    loadSyllabus();
  };

  // ============ SUB SYLLABUS CRUD ============



  const addSub = async (syllabusId, name) => {
    if (!name.trim()) return;
    await classAPI.addSubSyllabus(name, syllabusId);
    loadSyllabus();
  };

  const updateSub = async (subId, name) => {
    await classAPI.updateSubSyllabus(subId, name);
    loadSyllabus();
  };

  const deleteSub = async (subId) => {
    await classAPI.deleteSubSyllabus(subId);
    loadSyllabus();
  };


  const AddSubSection = ({ syllabusId, addSub }) => {
    const [name, setName] = useState("");

    return (
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="Add sub-syllabus"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            addSub(syllabusId, name);
            setName("");
          }}
          className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"
        >
          <FiPlus />
        </button>
      </div>
    );
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <FaRegImage className="text-5xl text-blue-400" />;
    if (type === "application/pdf") return <FaFilePdf className="text-5xl text-red-500" />;
    if (type.includes("presentation")) return <FaFilePowerpoint className="text-5xl text-orange-500" />;
    if (type.includes("spreadsheet")) return <FaFileExcel className="text-5xl text-green-600" />;
    if (type.includes("word")) return <FaFileWord className="text-5xl text-blue-600" />;

    return <FaFile className="text-5xl text-gray-500" />;
  };



  const SubItem = ({ sub, updateSub, deleteSub }) => {
    const [edit, setEdit] = useState(false);
    const [name, setName] = useState(sub.name);

    return (
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded">

        {edit ? (
          <input
            className="border px-2 py-1 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <span>{sub.name}</span>
        )}

        <div className="flex gap-3">
          <button
            className="text-blue-600"
            onClick={() =>
              edit ? (updateSub(sub.id, name), setEdit(false)) : setEdit(true)
            }
          >
            <FiEdit size={18} />
          </button>

          <button onClick={() => { setUploadDoc(true), setSelectedSubSyllabusId(sub.id) }}>Upload Doc</button>

          <button className="text-red-600" onClick={() => deleteSub(sub.id)}>
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  console.log("dcos", docs)

  const Docs = ({ docs }) => {
    const [preview, setPreview] = useState(null); // Stores selected doc for overlay

    const openPreview = (doc) => {
      const fileURL = `data:${doc.file_type};base64,${doc.file_data}`;
      setPreview({ ...doc, fileURL });
    };

    const closePreview = () => setPreview(null);

    return (
      <>
        {/* FILE LIST */}
        <div className="flex flex-wrap gap-4">
          {docs.map((doc) => {
            const fileURL = `data:${doc.file_type};base64,${doc.file_data}`;
            const icon = getFileIcon(doc.file_type);

            return (
              <div
                key={doc.id}
                className="w-40 p-3 border rounded shadow cursor-pointer hover:bg-gray-100"
                onClick={() => openPreview(doc)}
              >
                {/* Thumbnail */}
                {doc.file_type.startsWith("image/") ? (
                  <img
                    src={fileURL}
                    alt={doc.doc_title}
                    className="w-full h-24 object-cover rounded"
                  />
                ) : (
                  <img src={icon} className="w-16 mx-auto" />
                )}

                {/* File name */}
                <p className="text-center text-sm mt-2 truncate">{doc.doc_title}</p>
              </div>
            );
          })}
        </div>

        {/* FULLSCREEN OVERLAY PREVIEW */}
        {preview && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="p-4 rounded-lg w-11/12 h-5/6 relative" style={{ backgroundColor: '#9FCF9F' }}>
              <button
                onClick={closePreview}
                className="absolute top-2 right-2 text-xl text-gray-700 bg-gray-200 px-3 py-1 rounded"
              >
                ✖
              </button>

              <h2 className="text-lg mb-2 font-semibold">{preview.doc_title}</h2>

              {/* IMAGE VIEW */}
              {preview.file_type.startsWith("image/") && (
                <img
                  src={preview.fileURL}
                  alt={preview.doc_title}
                  className="w-full h-full object-contain"
                />
              )}

              {/* PDF VIEW */}
              {preview.file_type === "application/pdf" && (
                <iframe
                  src={preview.fileURL}
                  className="w-full h-full"
                  title="PDF Preview"
                ></iframe>
              )}

              {/* PPT, EXCEL, WORD – use Google Docs viewer */}
              {preview.file_type.includes("presentation") ||
                preview.file_type.includes("spreadsheet") ||
                preview.file_type.includes("word") ? (
                <iframe
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                    preview.fileURL
                  )}`}
                  className="w-full h-full"
                  title="Document Preview"
                ></iframe>
              ) : null}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <Docs docs={docs} />

      <h1 className="text-3xl font-bold mb-4">
        Syllabus for Class {classId}
      </h1>

      {/* ADD SYLLABUS */}
      <div className="flex gap-3 mb-6">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Enter syllabus name"
          value={addSyllabusName}
          onChange={(e) => setAddSyllabusName(e.target.value)}
        />
        <button
          onClick={handleAddSyllabus}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Add
        </button>
      </div>

      {/* SYLLABUS LIST */}
      <div className="space-y-4">
        {syllabus.map((sy) => (
          <div key={sy.id} className="shadow rounded p-4" style={{ backgroundColor: '#9FCF9F' }}>

            {/* Top Row */}
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [sy.id]: !prev[sy.id],
                    }))
                  }
                >
                  {expanded[sy.id] ? (
                    <FiChevronDown size={22} />
                  ) : (
                    <FiChevronRight size={22} />
                  )}
                </button>

                {/* Editable Syllabus Name */}
                {editMode === sy.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  <span className="text-xl font-semibold">{sy.syllabus_name}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  className="text-blue-600"
                  onClick={() =>
                    editMode === sy.id
                      ? handleUpdateSyllabus(sy.id)
                      : (setEditMode(sy.id), setEditName(sy.syllabus_name))
                  }
                >
                  <FiEdit size={20} />
                </button>

                <button className="border border-gray-800" onClick={() => { setUploadDoc(true), setSelectedSyllabusId(sy.id) }}>upoload docs</button>

                <button
                  className="text-red-600"
                  onClick={() => handleDeleteSyllabus(sy.id)}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>

            {/* SUB SYLLABUS SECTION */}
            {expanded[sy.id] && (
              <div className="mt-4 ml-8 space-y-3 border-l pl-4">




                {/* Add Sub-Syllabus */}
                <AddSubSection syllabusId={sy.id} addSub={addSub} />

                {/* Existing Sub-Syllabus */}
                {sy.sub_syllabus?.map((sub) => (
                  <SubItem
                    key={sub.id}
                    sub={sub}
                    updateSub={updateSub}
                    deleteSub={deleteSub}
                  />
                ))}
              </div>
            )}

            {uploadDoc && (
              <UploadDocs
                syllabusId={selelctedSyllabusId}
                subSyllabusId={selelctedSubSyllabusId}
                uploadDocs={classAPI.uploadDocs}
              />
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusPage;
