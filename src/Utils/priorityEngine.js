export function checkPriority(symptoms = {}) {
  if (symptoms.chestPain && symptoms.breathingDifficulty) {
    return { flagged: true, reason: "Chest pain combined with breathing difficulty" };
  }
  return { flagged: false, reason: null };
}
