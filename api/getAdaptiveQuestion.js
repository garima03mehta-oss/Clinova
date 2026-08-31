export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symptomText, history = {} } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment" });
  }

  const answeredCount = Object.keys(history).filter((k) => k !== "chiefComplaint").length;
  const historyText = Object.entries(history).map(([key, value]) => `${key}: ${value}`).join("\n");

  const prompt = `You are a clinical intake assistant, not a doctor.

Patient's chief complaint: "${history.chiefComplaint || symptomText}"

Information collected so far:
${historyText || "None yet"}

Number of follow-up questions already asked: ${answeredCount}

Respond ONLY with JSON in this exact format, nothing else:
{
  "chiefComplaint": "short category name",
  "followUpQuestions": [
    { "question": "a clarifying yes/no question", "type": "yesno", "key": "shortKeyName" }
  ]
}

Rules: never diagnose. Ask exactly ONE new clarifying question per response. Do not repeat a question already covered. If at least 3 follow-up questions have already been asked, or enough information is collected, return an empty followUpQuestions array. Otherwise always return exactly one question, never leave it empty before 3 questions.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "Gemini API rejected the request", geminiError: data });
    }

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: "Unexpected Gemini response shape", raw: data });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({ error: "Failed to parse Gemini output as JSON", rawText: cleaned });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Handler threw an exception", message: err.message });
  }
}