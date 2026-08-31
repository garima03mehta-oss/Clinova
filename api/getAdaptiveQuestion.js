export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const {
    symptomText = "",
    history = {},
    careSystem = "Allopathy",
  } = req.body || {};

  const apiKey = process.env.GEMINI_API_KEY;

  const chiefComplaint =
    history.chiefComplaint ||
    symptomText ||
    "Not provided";

  const historyEntries = Object.entries(history).filter(
    ([key]) => key !== "chiefComplaint"
  );

  const answeredCount = historyEntries.length;

  /*
   * Keep the already asked questions/answers visible to Gemini
   * so that it does not repeat them.
   */
  const historyText =
    historyEntries.length > 0
      ? historyEntries
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join("\n")
      : "None yet";

  /*
   * ---------------------------------------------------------
   * SMART FALLBACK QUESTIONS
   * ---------------------------------------------------------
   *
   * These are used only when Gemini is unavailable,
   * quota is exhausted, or the API returns an error.
   *
   * IMPORTANT:
   * Different questions have different input types.
   */
  const fallbackQuestions = [
    {
      question:
        "How long have you been experiencing these symptoms?",
      type: "text",
      key: "symptom_duration",
    },
    {
      question:
        "How would you describe the severity of your symptoms?",
      type: "choice",
      options: ["Mild", "Moderate", "Severe"],
      key: "symptom_severity",
    },
    {
      question:
        "Are your symptoms getting better, staying the same, or getting worse?",
      type: "choice",
      options: ["Better", "Same", "Worse"],
      key: "symptom_progression",
    },
    {
      question:
        "What usually makes your symptoms better or worse?",
      type: "text",
      key: "symptom_triggers",
    },
    {
      question:
        "Are there any other symptoms happening along with your main complaint?",
      type: "text",
      key: "associated_symptoms",
    },
    {
      question:
        "Are your symptoms affecting your normal daily activities?",
      type: "yesno",
      key: "daily_activity_impact",
    },
    {
      question:
        "Have you experienced a similar problem before?",
      type: "yesno",
      key: "previous_episode",
    },
    {
      question:
        "Have you already taken or tried anything for these symptoms?",
      type: "text",
      key: "previous_action",
    },
  ];

  /*
   * Find which fallback questions have already been answered.
   */
  const answeredKeys = new Set(
    historyEntries.map(([key]) => key)
  );

  /*
   * Pick the first fallback question that has not
   * already been asked.
   */
  const fallbackQuestion = fallbackQuestions.find(
    (question) => !answeredKeys.has(question.key)
  );

  /*
   * If we don't have an API key, immediately use fallback.
   */
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY missing. Using fallback question."
    );

    return res.status(200).json({
      chiefComplaint,
      source: "fallback",
      followUpQuestions:
        answeredCount >= 4 || !fallbackQuestion
          ? []
          : [fallbackQuestion],
    });
  }

  /*
   * We want only a limited number of adaptive questions.
   * Four is enough for a useful pre-consultation draft.
   */
  if (answeredCount >= 4) {
    return res.status(200).json({
      chiefComplaint,
      source: "interview-complete",
      followUpQuestions: [],
    });
  }

  /*
   * ---------------------------------------------------------
   * GEMINI PROMPT
   * ---------------------------------------------------------
   */
  const prompt = `
You are Clinova, an AI clinical intake assistant.

You are NOT a doctor.
You must NOT diagnose.
You must NOT prescribe medicines.
You must NOT recommend treatment.

Your job is to ask ONE useful follow-up question during
a patient pre-consultation interview.

CARE SYSTEM:
${careSystem}

PATIENT'S MAIN COMPLAINT:
"${chiefComplaint}"

INFORMATION ALREADY COLLECTED:
${historyText}

NUMBER OF ANSWERS ALREADY COLLECTED:
${answeredCount}

IMPORTANT:
Do NOT repeat a question whose information is already available.

The next question should provide useful information for
a doctor reviewing the eventual pre-consultation report.

Prioritize information such as:
- duration
- severity
- progression
- associated symptoms
- triggers or relieving factors
- effect on daily activities
- previous similar episodes
- anything else directly relevant to the complaint

Choose the most relevant question based on the actual complaint.
Do not blindly follow a fixed sequence.

QUESTION TYPES:

1. "text"
Use this when the patient needs to type a free-form answer.
Examples:
- How long have you been experiencing these symptoms?
- What makes your symptoms better or worse?
- What other symptoms are you experiencing?

2. "yesno"
Use this ONLY when the answer genuinely needs Yes or No.
Examples:
- Have you experienced this problem before?
- Are the symptoms affecting your sleep?

3. "choice"
Use this when there are a small number of clear options.
Examples:
- How severe are your symptoms?
- Are your symptoms getting better, worse, or staying the same?

For "choice", provide 2 to 5 short options.

VERY IMPORTANT:
Do NOT label every question as "yesno".

For example:
"How long have you been experiencing these symptoms?"
MUST be type "text".

"How would you describe the severity of your symptoms?"
SHOULD be type "choice".

"Are your symptoms getting better?"
CAN be type "choice" if the options are Better, Same, Worse.

Return ONLY valid JSON.

Exact format:

{
  "chiefComplaint": "short category name",
  "followUpQuestions": [
    {
      "question": "one clear question",
      "type": "text",
      "key": "shortUniqueKey",
      "options": []
    }
  ]
}

For a yes/no question:

{
  "chiefComplaint": "short category name",
  "followUpQuestions": [
    {
      "question": "one clear yes/no question",
      "type": "yesno",
      "key": "shortUniqueKey",
      "options": []
    }
  ]
}

For a multiple-choice question:

{
  "chiefComplaint": "short category name",
  "followUpQuestions": [
    {
      "question": "one clear question",
      "type": "choice",
      "key": "shortUniqueKey",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}

Do not include markdown.
Do not include code fences.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    /*
     * Gemini quota exhausted / API error:
     * use fallback instead of breaking the interview.
     */
    if (!response.ok) {
      console.error(
        "GEMINI ACTUAL ERROR:",
        data
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions:
          fallbackQuestion
            ? [fallbackQuestion]
            : [],
      });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn(
        "Gemini returned empty response. Using fallback."
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions:
          fallbackQuestion
            ? [fallbackQuestion]
            : [],
      });
    }

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(
        "Gemini JSON parse error:",
        cleaned
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions:
          fallbackQuestion
            ? [fallbackQuestion]
            : [],
      });
    }

    /*
     * Validate Gemini response.
     */
    if (
      !Array.isArray(
        parsed.followUpQuestions
      ) ||
      parsed.followUpQuestions.length === 0
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions:
          fallbackQuestion
            ? [fallbackQuestion]
            : [],
      });
    }

    const question =
      parsed.followUpQuestions[0];

    /*
     * Safety validation for question type.
     */
    const allowedTypes = [
      "text",
      "yesno",
      "choice",
    ];

    if (
      !allowedTypes.includes(
        question.type
      )
    ) {
      question.type = "text";
    }

    /*
     * Make sure choice questions actually have options.
     */
    if (question.type === "choice") {
      if (
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        question.type = "text";
        question.options = [];
      }
    } else {
      question.options = [];
    }

    /*
     * Prevent duplicate keys if Gemini accidentally
     * creates one that already exists.
     */
    if (
      !question.key ||
      answeredKeys.has(question.key)
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions:
          fallbackQuestion
            ? [fallbackQuestion]
            : [],
      });
    }

    return res.status(200).json({
      chiefComplaint:
        parsed.chiefComplaint ||
        chiefComplaint,
      source: "gemini",
      followUpQuestions: [
        {
          question:
            question.question ||
            fallbackQuestion?.question ||
            "Please describe your symptoms.",
          type: question.type,
          key:
            question.key ||
            fallbackQuestion?.key ||
            `question_${Date.now()}`,
          options:
            question.options || [],
        },
      ],
    });
  } catch (error) {
    console.error(
      "Adaptive question handler error:",
      error
    );

    /*
     * Never break the interview because Gemini is down.
     */
    return res.status(200).json({
      chiefComplaint,
      source: "fallback",
      followUpQuestions:
        fallbackQuestion
          ? [fallbackQuestion]
          : [],
    });
  }
}