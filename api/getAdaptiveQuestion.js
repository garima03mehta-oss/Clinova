export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing from environment",
    });
  }

  const {
    symptomText = "",
    history = {},
    careSystem = "Allopathy",
  } = req.body || {};

  const chiefComplaint =
    history.chiefComplaint ||
    symptomText ||
    "Not provided";

  const historyEntries = Object.entries(history).filter(
    ([key]) => key !== "chiefComplaint"
  );

  const answeredCount = historyEntries.length;

  if (answeredCount >= 3) {
    return res.status(200).json({
      chiefComplaint,
      followUpQuestions: [],
    });
  }

  const historyText =
    historyEntries.length > 0
      ? historyEntries
          .map(
            ([key, value]) =>
              `${key}: ${String(value)}`
          )
          .join("\n")
      : "None yet";

  const prompt = `
You are Clinova, an AI clinical intake assistant.

You are NOT a doctor.
Do not diagnose.
Do not prescribe medicines.
Do not recommend treatment.

CARE SYSTEM:
${careSystem}

PATIENT CHIEF COMPLAINT:
${chiefComplaint}

INFORMATION ALREADY COLLECTED:
${historyText}

Generate exactly ONE relevant follow-up question.

Requirements:
- The question must be relevant to the complaint.
- Do not repeat information already collected.
- Keep it simple.
- It must be answerable with Yes or No.
- Do not diagnose.
- Do not prescribe treatment.

Return ONLY valid JSON.

Format:
{
  "chiefComplaint": "short category name",
  "followUpQuestions": [
    {
      "question": "one clear yes/no question",
      "type": "yesno",
      "key": "shortUniqueKey"
    }
  ]
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini adaptive question error:",
        data
      );

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API rejected the request.",
        geminiError: data,
      });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({
        error:
          "Gemini returned an empty response.",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return res.status(500).json({
          error:
            "Gemini returned invalid JSON.",
          rawText,
        });
      }
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error(
      "Adaptive question handler error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to generate adaptive question.",
    });
  }
}