export function getNextQuestion(chiefComplaint, answeredSoFar = {}) {
  if (chiefComplaint === "chest pain" && !answeredSoFar.breathingDifficulty) {
    return "Do you have difficulty breathing?";
  }
  if (chiefComplaint === "abdominal pain" && !answeredSoFar.vomiting) {
    return "Have you had any vomiting?";
  }
  return "Can you describe your main problem in your own words?";
}