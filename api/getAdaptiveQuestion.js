// api/getAdaptiveQuestion.js

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
    language = "english",
  } = req.body || {};

  const selectedLanguage =
    String(language).toLowerCase().trim() === "hindi"
      ? "hindi"
      : "english";

  const apiKey = process.env.GEMINI_API_KEY;

  const safeHistory =
    history && typeof history === "object"
      ? history
      : {};

  const chiefComplaint =
    safeHistory.chiefComplaint ||
    safeHistory.symptomText ||
    safeHistory.symptoms ||
    symptomText ||
    "Not provided";

  const historyEntries = Object.entries(safeHistory).filter(
    ([key, value]) =>
      key !== "chiefComplaint" &&
      key !== "symptomText" &&
      key !== "symptoms" &&
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

  const answeredKeys = new Set(
    historyEntries.map(([key]) => key)
  );

  const answeredCount = historyEntries.length;

  const historyText =
    historyEntries.length > 0
      ? historyEntries
          .map(
            ([key, value]) =>
              `${key}: ${String(value)}`
          )
          .join("\n")
      : "None yet";

  // =========================================================
  // FALLBACK QUESTIONS
  // These are used ONLY when Gemini fails.
  // =========================================================

  const fallbackQuestions = {
    english: [
      {
        question:
          "How long have you been experiencing these symptoms?",
        type: "text",
        key: "symptom_duration",
        options: [],
      },
      {
        question:
          "How would you describe the severity of your symptoms?",
        type: "choice",
        key: "symptom_severity",
        options: [
          "Mild",
          "Moderate",
          "Severe",
        ],
      },
      {
        question:
          "Are your symptoms getting better, staying the same, or getting worse?",
        type: "choice",
        key: "symptom_progression",
        options: [
          "Getting better",
          "About the same",
          "Getting worse",
        ],
      },
      {
        question:
          "What makes your symptoms better or worse?",
        type: "text",
        key: "symptom_triggers",
        options: [],
      },
      {
        question:
          "Are you experiencing any other symptoms along with your main complaint?",
        type: "text",
        key: "associated_symptoms",
        options: [],
      },
      {
        question:
          "Are your symptoms affecting your normal daily activities?",
        type: "yesno",
        key: "daily_activity_impact",
        options: [],
      },
      {
        question:
          "Have you experienced a similar problem before?",
        type: "yesno",
        key: "previous_episode",
        options: [],
      },
      {
        question:
          "Have you already taken or tried anything for these symptoms?",
        type: "text",
        key: "previous_action",
        options: [],
      },
    ],

    hindi: [
      {
        question:
          "आप इन लक्षणों को कितने समय से अनुभव कर रहे हैं?",
        type: "text",
        key: "symptom_duration",
        options: [],
      },
      {
        question:
          "आपके लक्षणों की गंभीरता कैसी है?",
        type: "choice",
        key: "symptom_severity",
        options: [
          "हल्के",
          "मध्यम",
          "गंभीर",
        ],
      },
      {
        question:
          "आपके लक्षण बेहतर हो रहे हैं, वैसे ही हैं या बदतर हो रहे हैं?",
        type: "choice",
        key: "symptom_progression",
        options: [
          "बेहतर हो रहे हैं",
          "लगभग समान हैं",
          "बदतर हो रहे हैं",
        ],
      },
      {
        question:
          "ऐसी कौन सी चीजें हैं जिनसे आपके लक्षण बेहतर या बदतर होते हैं?",
        type: "text",
        key: "symptom_triggers",
        options: [],
      },
      {
        question:
          "क्या आपके मुख्य लक्षण के साथ कोई अन्य लक्षण भी हो रहे हैं?",
        type: "text",
        key: "associated_symptoms",
        options: [],
      },
      {
        question:
          "क्या आपके लक्षण आपकी सामान्य दैनिक गतिविधियों को प्रभावित कर रहे हैं?",
        type: "yesno",
        key: "daily_activity_impact",
        options: [],
      },
      {
        question:
          "क्या आपको पहले भी ऐसी ही समस्या हुई है?",
        type: "yesno",
        key: "previous_episode",
        options: [],
      },
      {
        question:
          "क्या आपने इन लक्षणों के लिए पहले से कुछ लिया या आजमाया है?",
        type: "text",
        key: "previous_action",
        options: [],
      },
    ],
  };

  const getFallbackQuestion = () => {
    return fallbackQuestions[selectedLanguage].find(
      (question) =>
        !answeredKeys.has(question.key)
    );
  };

  const fallbackQuestion = getFallbackQuestion();

  // =========================================================
  // IF INTERVIEW IS COMPLETE
  // =========================================================

  if (answeredCount >= 4) {
    return res.status(200).json({
      chiefComplaint,
      source: "interview-complete",
      followUpQuestions: [],
    });
  }

  // =========================================================
  // NO GEMINI API KEY → FALLBACK
  // =========================================================

  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY missing. Using fallback question."
    );

    return res.status(200).json({
      chiefComplaint,
      source: "fallback",
      followUpQuestions: fallbackQuestion
        ? [fallbackQuestion]
        : [],
    });
  }

  // =========================================================
  // LANGUAGE
  // =========================================================

  const languageInstruction =
    selectedLanguage === "hindi"
      ? `
The patient selected Hindi.

Generate the question in natural, simple Hindi.
The question MUST be written in Hindi.
Options MUST also be written in Hindi.
Do not return English questions.
`
      : `
The patient selected English.

Generate the question in clear, simple English.
The question MUST be written in English.
Options MUST also be written in English.
Do not return Hindi questions.
`;

  // =========================================================
  // GEMINI PROMPT
  // =========================================================

  const prompt = `
You are Clinova, an AI clinical intake assistant.

You are NOT a doctor.

Your ONLY job is to ask ONE relevant follow-up
question based on the patient's symptoms and
previous answers.

${languageInstruction}

PATIENT'S MAIN COMPLAINT:
"${chiefComplaint}"

CARE SYSTEM:
${careSystem}

INFORMATION ALREADY COLLECTED:
${historyText}

NUMBER OF ANSWERS:
${answeredCount}

ALREADY USED QUESTION KEYS:
${Array.from(answeredKeys).join(", ") || "None"}

IMPORTANT RULES:

1. Ask exactly ONE question.

2. Do NOT repeat any information already collected.

3. Select the next question intelligently based
   on the patient's actual complaint.

4. Do NOT blindly follow a fixed question sequence.

5. Questions should help a doctor understand
   the patient's complaint.

6. Possible areas include:
   - duration
   - severity
   - progression
   - associated symptoms
   - triggers
   - relieving factors
   - effect on daily activities
   - previous similar episodes
   - relevant history

7. Do NOT diagnose.

8. Do NOT prescribe medicines.

9. Do NOT recommend treatment.

10. Return ONLY valid JSON.

QUESTION TYPES:

"text"
For free-form answers.

"yesno"
ONLY when the question genuinely requires
Yes/No.

"choice"
For 2-5 clear options.

JSON FORMAT:

{
  "chiefComplaint": "short complaint category",
  "followUpQuestions": [
    {
      "question": "one clear question",
      "type": "text",
      "key": "unique_question_key",
      "options": []
    }
  ]
}

For choice:

{
  "chiefComplaint": "short complaint category",
  "followUpQuestions": [
    {
      "question": "one clear question",
      "type": "choice",
      "key": "unique_question_key",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3"
      ]
    }
  ]
}

For yes/no:

{
  "chiefComplaint": "short complaint category",
  "followUpQuestions": [
    {
      "question": "one clear yes/no question",
      "type": "yesno",
      "key": "unique_question_key",
      "options": []
    }
  ]
}

Do not include markdown.
Do not include code fences.
`;

  // =========================================================
  // GEMINI REQUEST
  // =========================================================

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

    // =======================================================
    // GEMINI ERROR → FALLBACK
    // =======================================================

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        data
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // GET GEMINI TEXT
    // =======================================================

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn(
        "Gemini returned empty response."
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // PARSE JSON
    // =======================================================

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Gemini JSON parse error:",
        cleaned
      );

      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // VALIDATE GEMINI QUESTION
    // =======================================================

    if (
      !Array.isArray(parsed.followUpQuestions) ||
      parsed.followUpQuestions.length === 0
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    const question =
      parsed.followUpQuestions[0];

    if (
      !question ||
      !question.question ||
      !question.key
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // PREVENT DUPLICATE QUESTION KEY
    // =======================================================

    if (answeredKeys.has(question.key)) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // VALIDATE TYPE
    // =======================================================

    const allowedTypes = [
      "text",
      "yesno",
      "choice",
    ];

    if (
      !allowedTypes.includes(question.type)
    ) {
      question.type = "text";
    }

    // =======================================================
    // VALIDATE OPTIONS
    // =======================================================

    if (question.type === "choice") {
      if (
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        question.options.length > 5
      ) {
        return res.status(200).json({
          chiefComplaint,
          source: "fallback",
          followUpQuestions: fallbackQuestion
            ? [fallbackQuestion]
            : [],
        });
      }
    } else {
      question.options = [];
    }

    // =======================================================
    // LANGUAGE VALIDATION
    // =======================================================

    const questionText =
      String(question.question);

    const hasHindi =
      /[\u0900-\u097F]/.test(
        questionText
      );

    if (
      selectedLanguage === "hindi" &&
      !hasHindi
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    if (
      selectedLanguage === "english" &&
      hasHindi
    ) {
      return res.status(200).json({
        chiefComplaint,
        source: "fallback",
        followUpQuestions: fallbackQuestion
          ? [fallbackQuestion]
          : [],
      });
    }

    // =======================================================
    // GEMINI SUCCESS
    // =======================================================

    console.log(
      "Gemini generated adaptive question:",
      question
    );

    return res.status(200).json({
      chiefComplaint:
        parsed.chiefComplaint ||
        chiefComplaint,

      source: "gemini",

      followUpQuestions: [
        {
          question: question.question,
          type: question.type,
          key: question.key,
          options: question.options || [],
        },
      ],
    });

  } catch (error) {
    // =======================================================
    // NETWORK / SERVER ERROR → FALLBACK
    // =======================================================

    console.error(
      "Adaptive question error:",
      error
    );

    return res.status(200).json({
      chiefComplaint,
      source: "fallback",
      followUpQuestions: fallbackQuestion
        ? [fallbackQuestion]
        : [],
    });
  }
}