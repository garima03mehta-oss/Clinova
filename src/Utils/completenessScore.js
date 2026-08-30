export function getCompletenessScore(history = {}) {
  const sections = [
    "chiefComplaint",
    "hpi",
    "medicationHistory",
    "allergyHistory",
    "familyHistory",
  ];

  const coreFilled = sections.filter((section) => {
    const value = history[section];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );
  }).length;

  const adaptiveAnswers = history.adaptiveAnswers || {};
  const adaptiveCount = Object.keys(adaptiveAnswers).length;

  const coreScore = (coreFilled / sections.length) * 60;
  const adaptiveScore = Math.min(adaptiveCount * 10, 40);

  return Math.min(Math.round(coreScore + adaptiveScore), 100);
}
