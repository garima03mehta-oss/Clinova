/*
 * Clinova AI Interview Engine
 *
 * Gemini generates adaptive questions according to
 * the language selected by the patient.
 *
 * Supported languages:
 *   - english
 *   - hindi
 *
 * Gemini unavailable:
 *   -> Local fallback questions in selected language
 *
 * IMPORTANT:
 * This module does NOT diagnose or prescribe.
 */

const FALLBACK_QUESTIONS = {
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
      options: ["Mild", "Moderate", "Severe"],
    },
    {
      question:
        "Are your symptoms getting better, staying the same, or getting worse?",
      type: "choice",
      key: "symptom_progression",
      options: ["Getting better", "About the same", "Getting worse"],
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
      options: ["Yes", "No"],
    },
    {
      question:
        "Have you experienced a similar problem before?",
      type: "yesno",
      key: "previous_episode",
      options: ["Yes", "No"],
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
      options: ["हल्के", "मध्यम", "गंभीर"],
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
      options: ["हाँ", "नहीं"],
    },
    {
      question:
        "क्या आपको पहले भी ऐसी ही समस्या हुई है?",
      type: "yesno",
      key: "previous_episode",
      options: ["हाँ", "नहीं"],
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

function normalizeLanguage(language) {
  return String(language || "english").toLowerCase() === "hindi"
    ? "hindi"
    : "english";
}

function isAnswered(history, key) {
  return (
    history &&
    Object.prototype.hasOwnProperty.call(history, key)
  );
}

function getFallbackQuestion(
  history = {},
  language = "english"
) {
  const selectedLanguage =
    normalizeLanguage(language);

  const questions =
    FALLBACK_QUESTIONS[selectedLanguage];

  return (
    questions.find(
      (question) =>
        !isAnswered(history, question.key)
    ) || null
  );
}

function normalizeQuestion(question, language) {
  if (!question) return null;

  const selectedLanguage =
    normalizeLanguage(language);

  const questionText = String(
    question.question || ""
  ).trim();

  const lowerQuestion =
    questionText.toLowerCase();

  let type = question.type || "text";

  let options = Array.isArray(question.options)
    ? question.options
    : [];

  /*
   * Duration -> text
   */
  if (
    lowerQuestion.includes("how long") ||
    lowerQuestion.includes("since when") ||
    lowerQuestion.includes("how many days") ||
    lowerQuestion.includes("how many weeks") ||
    lowerQuestion.includes("how many months") ||
    lowerQuestion.includes("for how long") ||
    lowerQuestion.includes("कितने समय") ||
    lowerQuestion.includes("कब से")
  ) {
    type = "text";
    options = [];
  }

  /*
   * Severity -> choice
   */
  if (
    lowerQuestion.includes("severity") ||
    lowerQuestion.includes("how severe") ||
    lowerQuestion.includes("how bad") ||
    lowerQuestion.includes("गंभीरता")
  ) {
    type = "choice";

    options =
      selectedLanguage === "hindi"
        ? ["हल्के", "मध्यम", "गंभीर"]
        : ["Mild", "Moderate", "Severe"];
  }

  /*
   * Progression -> choice
   */
  if (
    lowerQuestion.includes("getting better") ||
    lowerQuestion.includes("getting worse") ||
    lowerQuestion.includes("changing over time") ||
    lowerQuestion.includes("changed over time") ||
    lowerQuestion.includes("बेहतर") ||
    lowerQuestion.includes("बदतर") ||
    lowerQuestion.includes("समय के साथ")
  ) {
    type = "choice";

    options =
      selectedLanguage === "hindi"
        ? [
            "बेहतर हो रहे हैं",
            "लगभग समान हैं",
            "बदतर हो रहे हैं",
          ]
        : [
            "Getting better",
            "About the same",
            "Getting worse",
          ];
  }

  if (!["text", "yesno", "choice"].includes(type)) {
    type = "text";
  }

  if (type === "yesno") {
    options =
      selectedLanguage === "hindi"
        ? ["हाँ", "नहीं"]
        : ["Yes", "No"];
  }

  if (
    type === "choice" &&
    options.length < 2
  ) {
    type = "text";
    options = [];
  }

  return {
    question:
      questionText ||
      (selectedLanguage === "hindi"
        ? "कृपया अपने लक्षणों के बारे में बताएं।"
        : "Please describe your symptoms."),

    type,

    key:
      question.key ||
      `gemini_question_${Date.now()}`,

    options,
  };
}

export async function getAIQuestions(
  symptomText,
  history = {},
  language = "english"
) {
  const selectedLanguage =
    normalizeLanguage(language);

  const safeHistory = {
    ...history,
    chiefComplaint:
      history.chiefComplaint ||
      symptomText ||
      "",
  };

  try {
    const response = await fetch(
      "/api/getAdaptiveQuestion",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          symptomText: symptomText || "",
          history: safeHistory,
          language: selectedLanguage,
        }),
      }
    );

    const data =
      await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(
        "AI question service unavailable:",
        data
      );

      const fallback =
        getFallbackQuestion(
          safeHistory,
          selectedLanguage
        );

      return {
        chiefComplaint:
          symptomText || "",
        followUpQuestions: fallback
          ? [fallback]
          : [],
        source: "fallback",
      };
    }

    const questions =
      Array.isArray(data.followUpQuestions)
        ? data.followUpQuestions
        : [];

    if (questions.length === 0) {
      const fallback =
        getFallbackQuestion(
          safeHistory,
          selectedLanguage
        );

      return {
        chiefComplaint:
          data.chiefComplaint ||
          symptomText ||
          "",
        followUpQuestions: fallback
          ? [fallback]
          : [],
        source: "fallback",
      };
    }

    const normalized =
      normalizeQuestion(
        questions[0],
        selectedLanguage
      );

    if (
      normalized &&
      isAnswered(
        safeHistory,
        normalized.key
      )
    ) {
      const fallback =
        getFallbackQuestion(
          safeHistory,
          selectedLanguage
        );

      return {
        chiefComplaint:
          data.chiefComplaint ||
          symptomText ||
          "",
        followUpQuestions: fallback
          ? [fallback]
          : [],
        source: "fallback",
      };
    }

    return {
      chiefComplaint:
        data.chiefComplaint ||
        symptomText ||
        "",

      followUpQuestions: normalized
        ? [normalized]
        : [],

      source:
        data.source || "gemini",
    };
  } catch (error) {
    console.warn(
      "Gemini question request failed. Using fallback:",
      error
    );

    const fallback =
      getFallbackQuestion(
        safeHistory,
        selectedLanguage
      );

    return {
      chiefComplaint:
        symptomText || "",

      followUpQuestions: fallback
        ? [fallback]
        : [],

      source: "fallback",
    };
  }
}

export function getFallbackQuestions(
  language = "english"
) {
  const selectedLanguage =
    normalizeLanguage(language);

  return FALLBACK_QUESTIONS[
    selectedLanguage
  ].map((question) => ({
    ...question,
    options: [
      ...(question.options || []),
    ],
  }));
}