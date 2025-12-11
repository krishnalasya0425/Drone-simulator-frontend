import React, { useState } from "react";
import { parseRawQuestions } from "../utils/parseQuestions";
import test from "../entities/test.jsx";

export default function ParseQuestions() {
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      const cleaned = parseRawQuestions(rawJson);
      setQuestions(cleaned);
    } catch (err) {
      console.error("Error parsing: ", err);
      alert("Invalid JSON file!");
    }
  };

   const [selected, setSelected] = useState(() => questions.map(q => q.id));

  const toggleSelection = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };


  const handleSubmit = async () => {
  try {
    if (selected.length === 0) {
      alert("Select at least one question!");
      return;
    }

    const selectedQuestions = questions.filter(q => selected.includes(q.id));
    const payload = buildPayload(selectedQuestions);

    const data = await test.addQuestions(1, payload); 

    alert("Questions inserted successfully 🚀");
    console.log("Inserted:", data);

  } catch (err) {
    console.error(err);
    alert("An error occurred!");
  }
};


  
  
function buildPayload(questions) {
    console.log("Building payload for questions:", questions);
  return questions.map(q => ({
    question_text: q.text,
    type: q.type,
    answer: q.answer,
    options: q.options?.map((opt, idx) => ({
      label: String.fromCharCode(65 + idx), // A/B/C/D
      text: opt
    }))
  }));
}



  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Upload Raw Questions JSON</h1>

      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="border p-2"
      />


    <h2 className="text-2xl font-semibold">Generated Questions</h2>

      {questions.map((q, idx)=> (
        <div
          key={q.id}
          className="border p-4 shadow-sm rounded-md bg-white"
        >
          <div className="flex justify-between">
              <input
              type="checkbox"
              checked={selected.includes(q.id)}
              onChange={() => toggleSelection(q.id)}
            />
           <span> ( {idx} )</span>
            <span className="font-medium">{q.text}</span>
          
          </div>

          {/* TAGS */}
          <div className="text-sm text-gray-500 flex gap-2 mt-1">
            <span>Type: {q.type}</span>
          </div>

          <div className="mt-2">
            {q.type !== "tf" && (
              <ul>
  {q.options?.map((opt, idx) => {
    const letter = String.fromCharCode(65 + idx); // 65 = 'A'
    return (
      <li key={idx}>
        <b>{letter}.</b> {opt}
      </li>
    );
  })}
</ul>

            )}
          </div>

          <div className="mt-2 text-green-700">
            <b>Answer:</b> {q.answer}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Submit Selected
      </button>
    </div>
  );
}
