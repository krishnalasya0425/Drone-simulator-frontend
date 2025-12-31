
const API_URL = "http://localhost:5000/score";

export const RoomService = {
  // Add new score
  async postScore(testId, studentId, score, totalQuestions) {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId,
          studentId,
          score,
          totalQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit score");
      }

      return await response.json();
    } catch (error) {
      console.error("Error posting score:", error);
      throw error;
    }
  },
};





export default RoomService;