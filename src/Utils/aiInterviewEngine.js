export async function getAIQuestions(symptomText, history = {}) {
  const response = await fetch("/api/getAdaptiveQuestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symptomText,
      history,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error || "Failed to generate adaptive question"
    );
  }

  return response.json();
}