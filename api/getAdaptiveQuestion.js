export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symptomText, history = {} } = req.body;

  const answeredCount = Object.keys(history).filter((k) => k !== "chiefComplaint").length;
  const historyText = Object.entries(history)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const prompt = `You are a clinical intake assistant, not a doctor.

Patient's chief complaint: "${history.chiefComplaint || symptomText}"

Information collected so far:
${historyText || "None yet"}

Number of follow-up questions already asked: ${answeredCount}

Respond ONLY with JSON in this exact format, nothing else:
{
  "chiefComplaint": "short category name, e.g. chest pain, leg pain, blackout",
  "followUpQuestions": [
    { "question": "a clarifying yes/no question", "type": "yesno", "key": "shortKeyName" }
  ]
}

Rules:
- Never diagnose, never suggest treatment.
- Ask exactly ONE new clarifying question per response, based on what's already been answered.
- Do not repeat a question already covered in "Information collected so far".
- If at least 3 follow-up questions have already been asked (see count above), or you have enough information for a basic clinical history, return an empty followUpQuestions array to signal completion.
- Otherwise always return exactly one question in the array, never leave it empty before 3 questions are asked.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.candidates || !data.candidates[0]) {
      console.error("Gemini API error:", JSON.stringify(data));
      return res.status(500).json({ error: "Gemini API error" });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err.message);
    res.status(500).json({ error: "Failed to process symptom", message: err.message });
  }
}