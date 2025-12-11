export function parseRawQuestions(rawQuestions) {
  return rawQuestions.map(q => {
    const lines = q.full_text.trim().split("\n").map(l => l.trim());

    // Extract Question
    const questionLine = lines.find(l => l.startsWith("Q:"));
    const questionText = questionLine?.replace(/^Q:\s*/i, "").trim();

    // Extract Answer
    const answerLine = lines.find(l => l.startsWith("Answer:"));
    let correctAnswer = answerLine
      ? answerLine.replace(/^Answer:\s*/i, "").trim()
      : null;

    // Parse MCQ Options
    const options = [];
    const optionRegex = /^[A-D]\.\s*(.+)$/i;
    lines.forEach(line => {
      const match = line.match(optionRegex);
      if (match) options.push(match[1]);
    });

    // Convert answers like "A. xxxxx" → "A"
    if (/^[A-D]\./i.test(correctAnswer)) {
      correctAnswer = correctAnswer[0];
    }

    // Normalize True/False
    if (q.type === "tf") {
      correctAnswer =
        correctAnswer?.toLowerCase() === "true" ? "True" : "False";
    }

    return {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty || "medium",
      text: questionText,
      ...(options.length > 0 && { options }),
      answer: correctAnswer,
    };
  });
}
