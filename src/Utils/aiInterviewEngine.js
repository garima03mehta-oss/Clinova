export async function getAIQuestions(symptomText) {
  const response = await fetch("/api/getAdaptiveQuestion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptomText })
  });
  return response.json();
}