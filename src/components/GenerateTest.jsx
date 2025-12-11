import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import classAPI from "../entities/class";
import test from "../entities/test";
import {
  FaFilePdf,
} from "react-icons/fa";

const GenerateTest = () => {
  const { classId } = useParams();

  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [noQuestions, setNoQuestions] = useState(0);
  const [questionType, setQuestionType] = useState([]);
 const [selectedPdfs, setSelectedPdfs] = useState([]);

  const [testId, setTestId] = useState("");

  const loadDocs = async () => {
    try {
      // Filter only PDFs
      const res = await classAPI.getDocs(classId);

    // Filter PDFs
    const pdfDocs = res.docs.filter(
      (d) => d.file_type === "application/pdf"
    );

    setDocs(pdfDocs);  // <-- save ONLY PDFs
    } catch (err) {
      console.error("Failed to load docs", err.message);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [classId]);

  // Handle question type checkbox
  const toggleQuestionType = (type) => {
    setQuestionType((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const AddTest = async () => {
    if (!title) return alert("Please enter a test name");

    try {
      const res = await test.addTest(title);
      setTestId(res.data.id);
      alert("Test created!");
    } catch (error) {
      console.error(error);
    }
  };

 

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700">
        Generate Test
      </h1>

      {/* Test Name */}
      <div className="mb-6">
        <label className="font-semibold">Test Name</label>
        <input
          type="text"
          className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter test title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Number of Questions */}
      <div className="mb-6">
        <label className="font-semibold">Number of Questions: {noQuestions}</label>
        <input
          type="range"
          min="0"
          max="100"
          className="w-full"
          value={noQuestions}
          onChange={(e) => setNoQuestions(e.target.value)}
        />
      </div>

      {/* Question Types */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Question Types</label>

        <div className="flex flex-col gap-2">
          {["MCQ", "True/False", "Fill in the Blanks"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 border p-2 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={questionType.includes(type)}
                onChange={() => toggleQuestionType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Select PDF Source */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Select Source PDF</label>

       {docs.length === 0 ? (
  <p className="text-gray-500">No PDFs uploaded for this class.</p>
) : (
  <div className="flex flex-col gap-3">
    {docs.map((pdf) => (
      <label
        key={pdf.id}
        className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        <input
          type="checkbox"
          value={pdf.id}
          checked={selectedPdfs.includes(pdf.id)}
          onChange={() => {
            if (selectedPdfs.includes(pdf.id)) {
              // remove
              setSelectedPdfs(selectedPdfs.filter((id) => id !== pdf.id));
            } else {
              // add
              setSelectedPdfs([...selectedPdfs, pdf.id]);
            }
          }}
        />

        <FaFilePdf size={30} color="red" />

        <span className="font-medium">{pdf.doc_title}</span>
      </label>
    ))}
  </div>
)}

      </div>

      {/* Create Test Button */}
      <button
        onClick={AddTest}
        className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
      >
        Create Test
      </button>
    </div>
  );
};

export default GenerateTest;
