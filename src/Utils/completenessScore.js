export function getCompletenessScore(history) {
  const sections = ["chiefComplaint", "hpi", "medicationHistory", "allergyHistory", "familyHistory"];
  const filled = sections.filter((s) => history[s] && history[s] !== "");
  return Math.round((filled.length / sections.length) * 100);
}
