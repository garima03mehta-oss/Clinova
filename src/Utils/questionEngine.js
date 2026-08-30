function detectComplaint(text) {
  const lower = text.toLowerCase();
  if (lower.includes("chest")) return "chest pain";
  if (lower.includes("stomach") || lower.includes("abdomen") || lower.includes("belly")) return "abdominal pain";
  return "other";
}

export function getNextQuestion(chiefComplaint, answeredSoFar = {}) {
  if (!chiefComplaint) {
    return { type: "text", question: "What is your main problem today?" };
  }

  if (chiefComplaint === "chest pain" && !("breathingDifficulty" in answeredSoFar)) {
    return { type: "yesno", question: "Do you have difficulty breathing?", key: "breathingDifficulty" };
  }

  if (chiefComplaint === "abdominal pain" && !("vomiting" in answeredSoFar)) {
    return { type: "yesno", question: "Have you had any vomiting?", key: "vomiting" };
  }

  return { type: "text", question: "Any other details you'd like to add?" };
}

export { detectComplaint };