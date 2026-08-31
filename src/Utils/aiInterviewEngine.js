
 /* Clinova AI Interview Engine
 *
 * Gemini available:
 *   -> Gemini generates adaptive questions
 *
 * Gemini unavailable / quota exhausted:
 *   -> Local fallback questions are returned
 *
 * IMPORTANT:
 * This module does NOT diagnose or prescribe.
 */

const FALLBACK_QUESTIONS = [
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
      "How are your symptoms changing over time?",
    type: "choice",
    key: "symptom_progression",
    options: [
      "Getting better",
      "Getting worse",
      "About the same",
    ],
  },

  {
    question:
      "Are there any other symptoms or important details you think your doctor should know?",
    type: "text",
    key: "associated_symptoms",
    options: [],
  },
];

/*
 * Check whether a fallback question has already been answered.
 */
function isAnswered(history, key) {
  return (
    history &&
    Object.prototype.hasOwnProperty.call(
      history,
      key
    )
  );
}

/*
 * Get the next local fallback question.
 */
function getFallbackQuestion(history = {}) {
  const next = FALLBACK_QUESTIONS.find(
    (question) =>
      !isAnswered(history, question.key)
  );

  if (!next) {
    return null;
  }

  return next;
}

/*
 * Normalize Gemini question.
 *
 * This prevents questions such as:
 *
 * "How long..."
 *
 * from accidentally becoming Yes/No.
 */
function normalizeQuestion(question) {
  if (!question) {
    return null;
  }

  const questionText = String(
    question.question || ""
  ).trim();

  const lowerQuestion =
    questionText.toLowerCase();

  let type = question.type || "text";

  let options = Array.isArray(
    question.options
  )
    ? question.options
    : [];

  /*
   * Duration questions -> TEXT
   */
  if (
    lowerQuestion.includes("how long") ||
    lowerQuestion.includes("since when") ||
    lowerQuestion.includes("how many days") ||
    lowerQuestion.includes("how many weeks") ||
    lowerQuestion.includes("how many months") ||
    lowerQuestion.includes("for how long")
  ) {
    type = "text";
    options = [];
  }

  /*
   * Severity questions -> CHOICE
   */
  if (
    lowerQuestion.includes("severity") ||
    lowerQuestion.includes("how severe") ||
    lowerQuestion.includes("how bad")
  ) {
    type = "choice";

    options = [
      "Mild",
      "Moderate",
      "Severe",
    ];
  }

  /*
   * Progression questions -> CHOICE
   */
  if (
    lowerQuestion.includes("getting better") ||
    lowerQuestion.includes("getting worse") ||
    lowerQuestion.includes(
      "changing over time"
    ) ||
    lowerQuestion.includes(
      "changed over time"
    )
  ) {
    type = "choice";

    options = [
      "Getting better",
      "Getting worse",
      "About the same",
    ];
  }

  /*
   * Only allow supported types.
   */
  if (
    ![
      "text",
      "yesno",
      "choice",
    ].includes(type)
  ) {
    type = "text";
  }

  /*
   * Genuine Yes/No question.
   */
  if (type === "yesno") {
    options = ["Yes", "No"];
  }

  /*
   * Choice without enough options -> text.
   */
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
      "Please describe your symptoms.",

    type,

    key:
      question.key ||
      `gemini_question_${Date.now()}`,

    options,
  };
}

/*
 * ---------------------------------------------------------
 * MAIN FUNCTION
 * ---------------------------------------------------------
 *
 * This is the function Interview.jsx imports:
 *
 * import { getAIQuestions }
 * from "../../../utils/aiInterviewEngine";
 */
export async function getAIQuestions(
  symptomText,
  history = {}
) {
  /*
   * Always make sure chiefComplaint exists.
   */
  const safeHistory = {
    ...history,
    chiefComplaint:
      history.chiefComplaint ||
      symptomText ||
      "",
  };

  /*
   * First try the backend/Gemini API.
   */
  try {
    const response = await fetch(
      "/api/getAdaptiveQuestion",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          symptomText:
            symptomText || "",
          history: safeHistory,
        }),
      }
    );

    /*
     * Read response safely.
     */
    const data =
      await response
        .json()
        .catch(() => ({}));

    /*
     * Gemini/API failed.
     *
     * Instead of throwing an error,
     * use local fallback questions.
     *
     * This handles:
     * - 429 quota
     * - 500 server error
     * - 404 API route
     * - network errors
     */
    if (!response.ok) {
      console.warn(
        "AI question service unavailable:",
        data
      );

      const fallback =
        getFallbackQuestion(
          safeHistory
        );

      if (!fallback) {
        return {
          chiefComplaint:
            symptomText || "",
          followUpQuestions: [],
          source: "fallback",
        };
      }

      return {
        chiefComplaint:
          symptomText || "",
        followUpQuestions: [
          fallback,
        ],
        source: "fallback",
      };
    }

    /*
     * Gemini/API returned successfully.
     */
    const questions =
      Array.isArray(
        data.followUpQuestions
      )
        ? data.followUpQuestions
        : [];

    /*
     * If backend returns no question,
     * use fallback.
     */
    if (questions.length === 0) {
      const fallback =
        getFallbackQuestion(
          safeHistory
        );

      if (!fallback) {
        return {
          chiefComplaint:
            data.chiefComplaint ||
            symptomText ||
            "",
          followUpQuestions: [],
          source: "fallback",
        };
      }

      return {
        chiefComplaint:
          data.chiefComplaint ||
          symptomText ||
          "",
        followUpQuestions: [
          fallback,
        ],
        source: "fallback",
      };
    }

    /*
     * Normalize Gemini's question.
     */
    const normalized =
      normalizeQuestion(
        questions[0]
      );

    /*
     * Don't return a duplicate question.
     */
    if (
      normalized &&
      isAnswered(
        safeHistory,
        normalized.key
      )
    ) {
      const fallback =
        getFallbackQuestion(
          safeHistory
        );

      if (!fallback) {
        return {
          chiefComplaint:
            data.chiefComplaint ||
            symptomText ||
            "",
          followUpQuestions: [],
          source: "gemini",
        };
      }

      return {
        chiefComplaint:
          data.chiefComplaint ||
          symptomText ||
          "",
        followUpQuestions: [
          fallback,
        ],
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

      source: "gemini",
    };
  } catch (error) {
    /*
     * Network error / API unavailable.
     *
     * DO NOT break the interview.
     */
    console.warn(
      "Gemini question request failed. Using fallback:",
      error
    );

    const fallback =
      getFallbackQuestion(
        safeHistory
      );

    if (!fallback) {
      return {
        chiefComplaint:
          symptomText || "",
        followUpQuestions: [],
        source: "fallback",
      };
    }

    return {
      chiefComplaint:
        symptomText || "",

      followUpQuestions: [
        fallback,
      ],

      source: "fallback",
    };
  }
}

/*
 * Optional named export.
 *
 * Useful if you want to test the fallback questions
 * somewhere else.
 */
export function getFallbackQuestions() {
  return FALLBACK_QUESTIONS.map(
    (question) => ({
      ...question,
      options: [
        ...(question.options || []),
      ],
    })
  );
}
