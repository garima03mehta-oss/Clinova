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
    String(language).toLowerCase() === "hindi"
      ? "hindi"
      : "english";

  const apiKey =
    process.env.GEMINI_API_KEY;

  const chiefComplaint =
    history.chiefComplaint ||
    symptomText ||
    "Not provided";

  const historyEntries =
    Object.entries(history).filter(
      ([key]) => key !== "chiefComplaint"
    );

  const answeredCount =
    historyEntries.length;

  const historyText =
    historyEntries.length > 0
      ? historyEntries
          .map(
            ([key, value]) =>
              `${key}: ${String(value)}`
          )
          .join("\n")
      : "None yet";

  /*
   * ---------------------------------------------------------
   * FALLBACK QUESTIONS
   * ---------------------------------------------------------
   */

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
        options: [
          "Mild",
          "Moderate",
          "Severe",
        ],
        key: "symptom_severity",
      },
      {
        question:
          "Are your symptoms getting better, staying the same, or getting worse?",
        type: "choice",
        options: [
          "Getting better",
          "About the same",
          "Getting worse",
        ],
        key: "symptom_progression",
      },
      {
        question:
          "What usually makes your symptoms better or worse?",
        type: "text",
        key: "symptom_triggers",
        options: [],
      },
      {
        question:
          "Are there any other symptoms happening along with your main complaint?",
        type: "text",
        key: "associated_symptoms",
        options: [],
      },
      {
        question:
          "Are your symptoms affecting your normal daily activities?",
        type: "yesno",
        key: "daily_activity_impact",
        options: [
          "Yes",
          "No",
        ],
      },
      {
        question:
          "Have you experienced a similar problem before?",
        type: "yesno",
        key: "previous_episode",
        options: [
          "Yes",
          "No",
        ],
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
        options: [
          "हल्के",
          "मध्यम",
          "गंभीर",
        ],
        key: "symptom_severity",
      },
      {
        question:
          "आपके लक्षण बेहतर हो रहे हैं, वैसे ही हैं या बदतर हो रहे हैं?",
        type: "choice",
        options: [
          "बेहतर हो रहे हैं",
          "लगभग समान हैं",
          "बदतर हो रहे हैं",
        ],
        key: "symptom_progression",
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
        options: [
          "हाँ",
          "नहीं",
        ],
      },
      {
        question:
          "क्या आपको पहले भी ऐसी ही समस्या हुई है?",
        type: "yesno",
        key: "previous_episode",
        options: [
          "हाँ",
          "नहीं",
        ],
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

  const answeredKeys =
    new Set(
      historyEntries.map(
        ([key]) => key
      )
    );

  const fallbackQuestion =
    fallbackQuestions[
      selectedLanguage
    ].find(
      (question) =>
        !answeredKeys.has(
          question.key
        )
    );

  /*
   * No API key
   */

  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY missing. Using fallback."
    );

    return res.status(200).json({
      chiefComplaint,
      source: "fallback",
      followUpQuestions:
        answeredCount >= 4 ||
        !fallbackQuestion
          ? []
          : [fallbackQuestion],
    });
  }

  /*
   * Maximum 4 questions
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
   * LANGUAGE INSTRUCTION
   * ---------------------------------------------------------
   */

  const languageInstruction =
    selectedLanguage === "hindi"
      ? `
LANGUAGE REQUIREMENT:

The patient selected Hindi.

You MUST generate the question in natural,
easy-to-understand Hindi.

The question text MUST be in Hindi.

Choice options MUST also be in Hindi.

Do NOT return English questions.

Medical terms may remain in commonly understood
English form only when a natural Hindi equivalent
would be confusing.
`
      : `
LANGUAGE REQUIREMENT:

The patient selected English.

You MUST generate the question in clear,
simple English.

The question text MUST be in English.

Choice options MUST also be in English.

Do NOT return Hindi questions.
`;

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

Your job is to ask ONE useful follow-up question
during a patient pre-consultation interview.

${languageInstruction}

CARE SYSTEM:
${careSystem}

PATIENT'S MAIN COMPLAINT:
"${chiefComplaint}"

INFORMATION ALREADY COLLECTED:
${historyText}

NUMBER OF ANSWERS ALREADY COLLECTED:
${answeredCount}

IMPORTANT:

Do NOT repeat information that has already been
collected.

Ask only ONE question.

The next question should provide useful information
for a doctor reviewing the eventual pre-consultation
report.

Prioritize information such as:

- duration
- severity
- progression
- associated symptoms
- triggers or relieving factors
- effect on daily activities
- previous similar episodes
- other directly relevant information

Choose the most relevant question based on the
actual complaint.

Do not blindly follow a fixed sequence.

QUESTION TYPES:

1. "text"

Use this when the patient needs to type a
free-form answer.

2. "yesno"

Use this ONLY when the answer genuinely needs
Yes or No.

3. "choice"

Use this when there are a small number of clear
options.

For "choice", provide 2 to 5 short options.

IMPORTANT:

Do NOT label every question as "yesno".

For example:

A duration question must be "text".

A severity question should be "choice".

A progression question should usually be "choice".

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

For yes/no:

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

For multiple choice:

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
    const response =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
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
              responseMimeType:
                "application/json",
            },
          }),
        }
      );

    const data =
      await response.json();

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
        "Gemini returned empty response."
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

    const cleaned =
      rawText
        .replace(
          /```json/gi,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    let parsed;

    try {
      parsed =
        JSON.parse(cleaned);
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

    if (
      !Array.isArray(
        parsed.followUpQuestions
      ) ||
      parsed.followUpQuestions
        .length === 0
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

    if (
      question.type === "choice"
    ) {
      if (
        !Array.isArray(
          question.options
        ) ||
        question.options.length < 2
      ) {
        question.type = "text";
        question.options = [];
      }
    } else {
      question.options = [];
    }

    if (
      !question.key ||
      answeredKeys.has(
        question.key
      )
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

    /*
     * Extra language protection.
     *
     * If Hindi was selected but Gemini somehow
     * returns an obviously English question,
     * fallback to Hindi.
     *
     * Same for English.
     */

    const questionText =
      String(
        question.question || ""
      );

    if (
      selectedLanguage === "hindi"
    ) {
      const hasHindi =
        /[\u0900-\u097F]/.test(
          questionText
        );

      if (!hasHindi) {
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

    if (
      selectedLanguage === "english"
    ) {
      const hasHindi =
        /[\u0900-\u097F]/.test(
          questionText
        );

      if (hasHindi) {
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