import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAIQuestions } from "../../../utils/aiInterviewEngine";

export default function Interview() {
  const navigate = useNavigate();

  const [symptomText, setSymptomText] = useState("");
  const [history, setHistory] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [started, setStarted] = useState(false);

  /*
   * ---------------------------------------------------------
   * FALLBACK QUESTIONS
   * ---------------------------------------------------------
   * These are used ONLY when Gemini is unavailable.
   *
   * They intentionally have different answer types:
   *
   * 1. Duration -> text
   * 2. Severity -> choice
   * 3. Pattern/change -> choice
   * 4. Associated symptoms -> text
   *
   * They are generic enough to work with different complaints,
   * but useful enough to help create the pre-report.
   */

  const fallbackQuestions = [
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
   * ---------------------------------------------------------
   * LOAD PREVIOUS INTERVIEW DATA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem(
          "clinovaInterviewHistory"
        ) || "{}"
      );

      const savedSymptom =
        localStorage.getItem(
          "clinovaSymptoms"
        ) || "";

      setHistory(savedHistory);

      setSymptomText(
        savedHistory.chiefComplaint ||
          savedSymptom
      );
    } catch (err) {
      console.error(
        "Unable to load interview data:",
        err
      );
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * NORMALIZE QUESTION
   * ---------------------------------------------------------
   */

  const normalizeQuestion = (question) => {
    if (!question) {
      return null;
    }

    let type = question.type || "text";

    /*
     * IMPORTANT:
     *
     * Gemini sometimes returns an incorrect type.
     *
     * We correct common questions here so they don't
     * accidentally appear as Yes/No.
     */

    const questionText = String(
      question.question || ""
    ).trim();

    const lowerQuestion =
      questionText.toLowerCase();

    /*
     * Duration questions MUST be text.
     */

    if (
      lowerQuestion.includes("how long") ||
      lowerQuestion.includes("since when") ||
      lowerQuestion.includes("how many days") ||
      lowerQuestion.includes("how many weeks") ||
      lowerQuestion.includes("how many months")
    ) {
      type = "text";
    }

    /*
     * Severity questions MUST be choice.
     */

    if (
      lowerQuestion.includes("severity") ||
      lowerQuestion.includes("how severe") ||
      lowerQuestion.includes("how bad")
    ) {
      type = "choice";
    }

    /*
     * Improvement / worsening questions can be choice.
     */

    if (
      lowerQuestion.includes(
        "getting better"
      ) ||
      lowerQuestion.includes(
        "getting worse"
      ) ||
      lowerQuestion.includes(
        "changed over time"
      ) ||
      lowerQuestion.includes(
        "changing over time"
      )
    ) {
      type = "choice";
    }

    /*
     * Allowed types only.
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

    let options = Array.isArray(
      question.options
    )
      ? question.options
      : [];

    /*
     * If Gemini says severity but forgets options,
     * provide useful options.
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
     * If Gemini asks about symptom progression,
     * make it a choice question.
     */

    if (
      lowerQuestion.includes(
        "getting better"
      ) ||
      lowerQuestion.includes(
        "getting worse"
      ) ||
      lowerQuestion.includes(
        "changed over time"
      ) ||
      lowerQuestion.includes(
        "changing over time"
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
     * Yes/No should ONLY be used when the question
     * is genuinely a yes/no question.
     */

    if (type === "yesno") {
      options = ["Yes", "No"];
    }

    /*
     * Choice without enough options becomes text.
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
        `question_${Date.now()}`,

      options,
    };
  };

  /*
   * ---------------------------------------------------------
   * GET NEXT FALLBACK QUESTION
   * ---------------------------------------------------------
   */

  const getNextFallbackQuestion = (
    currentHistory
  ) => {
    return fallbackQuestions.find(
      (question) =>
        currentHistory[
          question.key
        ] === undefined
    );
  };

  /*
   * ---------------------------------------------------------
   * START INTERVIEW
   * ---------------------------------------------------------
   */

  const startInterview = async () => {
    if (!symptomText.trim()) {
      setError(
        "Please enter your main symptom first."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const initialHistory = {
        ...history,
        chiefComplaint:
          symptomText.trim(),
      };

      setHistory(initialHistory);

      localStorage.setItem(
        "clinovaInterviewHistory",
        JSON.stringify(
          initialHistory
        )
      );

      localStorage.setItem(
        "clinovaSymptoms",
        symptomText.trim()
      );

      let result = null;

      /*
       * Try Gemini first.
       */

      try {
        result =
          await getAIQuestions(
            symptomText.trim(),
            initialHistory
          );

        console.log(
          "Gemini first response:",
          result
        );
      } catch (geminiError) {
        /*
         * Gemini unavailable / quota exhausted.
         * Do NOT stop the interview.
         */

        console.warn(
          "Gemini unavailable. Using fallback questions.",
          geminiError
        );
      }

      let nextQuestion = null;

      /*
       * Gemini question.
       */

      if (
        result &&
        Array.isArray(
          result.followUpQuestions
        ) &&
        result.followUpQuestions.length >
          0
      ) {
        nextQuestion =
          normalizeQuestion(
            result.followUpQuestions[0]
          );
      }

      /*
       * If Gemini didn't provide a question,
       * use fallback.
       */

      if (!nextQuestion) {
        const fallback =
          getNextFallbackQuestion(
            initialHistory
          );

        if (fallback) {
          nextQuestion =
            normalizeQuestion(
              fallback
            );
        }
      }

      /*
       * No question available.
       */

      if (!nextQuestion) {
        navigateToDocuments(
          initialHistory
        );
        return;
      }

      setCurrentQuestion(
        nextQuestion
      );

      setQuestionNumber(1);
      setStarted(true);
      setAnswer("");
    } catch (err) {
      console.error(
        "AI Interview Error:",
        err
      );

      /*
       * Even if something unexpected happens,
       * try fallback instead of showing a broken screen.
       */

      const fallback =
        getNextFallbackQuestion(
          history
        );

      if (fallback) {
        const normalized =
          normalizeQuestion(
            fallback
          );

        setCurrentQuestion(
          normalized
        );

        setQuestionNumber(1);
        setStarted(true);
        setAnswer("");

        setError(
          "AI questions are temporarily unavailable. Using standard clinical questions."
        );
      } else {
        setError(
          "Unable to start the interview. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT ANSWER
   * ---------------------------------------------------------
   */

  const submitAnswer = async () => {
    if (!currentQuestion) {
      return;
    }

    const trimmedAnswer =
      answer.trim();

    if (!trimmedAnswer) {
      setError(
        "Please provide an answer."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * Save current answer.
       */

      const updatedHistory = {
        ...history,
        [currentQuestion.key]:
          trimmedAnswer,
      };

      setHistory(
        updatedHistory
      );

      localStorage.setItem(
        "clinovaInterviewHistory",
        JSON.stringify(
          updatedHistory
        )
      );

      let result = null;

      /*
       * Try Gemini for the next question.
       */

      try {
        result =
          await getAIQuestions(
            symptomText,
            updatedHistory
          );

        console.log(
          "Gemini next response:",
          result
        );
      } catch (geminiError) {
        console.warn(
          "Gemini unavailable for next question. Using fallback.",
          geminiError
        );
      }

      let nextQuestion = null;

      /*
       * Use Gemini question if available.
       */

      if (
        result &&
        Array.isArray(
          result.followUpQuestions
        ) &&
        result.followUpQuestions.length >
          0
      ) {
        nextQuestion =
          normalizeQuestion(
            result.followUpQuestions[0]
          );
      }

      /*
       * Prevent duplicate question keys.
       */

      if (
        nextQuestion &&
        updatedHistory[
          nextQuestion.key
        ] !== undefined
      ) {
        nextQuestion = null;
      }

      /*
       * If Gemini didn't give a usable question,
       * use fallback question.
       */

      if (!nextQuestion) {
        const fallback =
          getNextFallbackQuestion(
            updatedHistory
          );

        if (fallback) {
          nextQuestion =
            normalizeQuestion(
              fallback
            );
        }
      }

      /*
       * Maximum 4 follow-up questions.
       *
       * This keeps the interview short and useful.
       */

      const answeredFollowUps =
        Object.keys(
          updatedHistory
        ).filter(
          (key) =>
            key !== "chiefComplaint"
        ).length;

      if (
        answeredFollowUps >= 4 ||
        !nextQuestion
      ) {
        navigateToDocuments(
          updatedHistory
        );
        return;
      }

      /*
       * Set next question.
       */

      setCurrentQuestion(
        nextQuestion
      );

      setQuestionNumber(
        (prev) => prev + 1
      );

      setAnswer("");
    } catch (err) {
      console.error(
        "Interview answer error:",
        err
      );

      /*
       * Last-resort fallback.
       */

      const updatedHistory = {
        ...history,
        [currentQuestion.key]:
          trimmedAnswer,
      };

      const fallback =
        getNextFallbackQuestion(
          updatedHistory
        );

      if (fallback) {
        const normalized =
          normalizeQuestion(
            fallback
          );

        setHistory(
          updatedHistory
        );

        localStorage.setItem(
          "clinovaInterviewHistory",
          JSON.stringify(
            updatedHistory
          )
        );

        setCurrentQuestion(
          normalized
        );

        setQuestionNumber(
          (prev) => prev + 1
        );

        setAnswer("");

        setError(
          "AI is temporarily unavailable. Continuing with standard questions."
        );
      } else {
        navigateToDocuments(
          updatedHistory
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * GO TO DOCUMENTS
   * ---------------------------------------------------------
   */

  const navigateToDocuments = (
    finalHistory
  ) => {
    localStorage.setItem(
      "clinovaInterviewHistory",
      JSON.stringify(
        finalHistory
      )
    );

    navigate("/documents");
  };

  /*
   * ---------------------------------------------------------
   * KEYBOARD SUPPORT
   * ---------------------------------------------------------
   */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      currentQuestion?.type ===
        "text"
    ) {
      event.preventDefault();

      submitAnswer();
    }
  };

  /*
   * ---------------------------------------------------------
   * START SCREEN
   * ---------------------------------------------------------
   */

  if (!started) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F6F8F7",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#FFFFFF",
            padding: "32px",
            borderRadius: "20px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              color: "#0E6E64",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            STEP 1 • CLINICAL INTERVIEW
          </p>

          <h1
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            Tell us about your symptoms
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            Clinova will ask a few relevant
            questions to organize information
            for your doctor.
          </p>

          <textarea
            value={symptomText}
            onChange={(e) =>
              setSymptomText(
                e.target.value
              )
            }
            placeholder="For example: I have been having a headache since yesterday..."
            rows={5}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #D1D5DB",
              fontSize: "15px",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "10px",
                background: "#FEF2F2",
                color: "#B91C1C",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={
              startInterview
            }
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: loading
                ? "#9CA3AF"
                : "#0E6E64",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "🤖 Preparing questions..."
              : "Start Clinical Interview →"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * INTERVIEW SCREEN
   * ---------------------------------------------------------
   */

  return (
 fix/gemini-context-and-min-questions
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8F7",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#FFFFFF",
          padding: "32px",
          borderRadius: "20px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* HEADER */}

        <p
          style={{
            color: "#0E6E64",
            fontWeight: "700",
            fontSize: "13px",
          }}
        >
          CLINOVA • ADAPTIVE INTERVIEW
        </p>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#1F2937",
            }}
          >
            Clinical Questions
          </h1>

          <span
            style={{
              fontSize: "13px",
              color: "#6B7280",
              whiteSpace: "nowrap",
            }}
          >
            Question {questionNumber}
          </span>
        </div>

        {/* COMPLAINT */}

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "#EAF5F3",
            color: "#084C44",
          }}
        >
          <strong>
            Main complaint:
          </strong>{" "}
          {symptomText}
        </div>

        {/* QUESTION */}

        {currentQuestion && (
          <div
            style={{
              marginTop: "28px",
            }}
          >
            <h2
              style={{
                color: "#1F2937",
                lineHeight: 1.4,
              }}
            >
              {currentQuestion.question}
            </h2>

            {/* TEXT QUESTION */}

            {currentQuestion.type ===
              "text" && (
              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Type your answer here..."
                rows={4}
                autoFocus
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "14px",
                  borderRadius: "12px",
                  border:
                    "1px solid #D1D5DB",
                  fontSize: "15px",
                  boxSizing:
                    "border-box",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            )}

            {/* YES / NO QUESTION */}

            {currentQuestion.type ===
              "yesno" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {["Yes", "No"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setAnswer(
                          option
                        )
                      }
                      style={{
                        padding: "15px",
                        borderRadius:
                          "12px",
                        border:
                          answer ===
                          option
                            ? "2px solid #0E6E64"
                            : "1px solid #D1D5DB",
                        background:
                          answer ===
                          option
                            ? "#EAF5F3"
                            : "#FFFFFF",
                        color:
                          "#1F2937",
                        fontWeight:
                          "700",
                        fontSize:
                          "15px",
                        cursor:
                          "pointer",
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}

            {/* CHOICE QUESTION */}

            {currentQuestion.type ===
              "choice" && (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                {currentQuestion.options.map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setAnswer(
                          option
                        )
                      }
                      style={{
                        padding: "15px",
                        borderRadius:
                          "12px",
                        border:
                          answer ===
                          option
                            ? "2px solid #0E6E64"
                            : "1px solid #D1D5DB",
                        background:
                          answer ===
                          option
                            ? "#EAF5F3"
                            : "#FFFFFF",
                        color:
                          "#1F2937",
                        fontWeight:
                          "600",
                        fontSize:
                          "15px",
                        cursor:
                          "pointer",
                        textAlign:
                          "left",
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    "#FEF2F2",
                  color: "#B91C1C",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* NEXT */}

            <button
              onClick={
                submitAnswer
              }
              disabled={
                !answer.trim() ||
                loading
              }
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background:
                  !answer.trim() ||
                  loading
                    ? "#9CA3AF"
                    : "#0E6E64",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "700",
                cursor:
                  !answer.trim() ||
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "🤖 Thinking..."
                : "Continue →"}
            </button>
          </div>
        )}
<div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
  <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">
    <p className="text-text-muted text-xs font-mono mb-4">Completeness: {completeness}%</p>
    <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${completeness}%` }}
      />
    </div>
    {priorityAlert && (
      <div className="bg-red-50 border border-danger rounded-xl p-3 mb-4">
        <p className="text-danger text-sm font-medium">⚠️ {priorityAlert}</p>
      </div>
    )}
    <p className="font-display text-xl text-text mb-6">{currentQuestion}</p>
    <div className="flex gap-3">
      <button
        onClick={() => handleAnswer("breathingDifficulty", true)}
        className="flex-1 bg-primary text-white py-3 rounded-xl"
      >
        Yes
      </button>
      <button
        onClick={() => handleAnswer("breathingDifficulty", false)}
        className="flex-1 bg-surface border-2 border-primary text-primary py-3 rounded-xl"
      >
        No
      </button>
    </div>
  </div>

  {/* FOOTER */}
  <p
    style={{
      marginTop: "28px",
      color: "#6B7280",
      fontSize: "12px",
      lineHeight: 1.5,
      textAlign: "center",
    }}
  >
    Clinova provides an AI-generated pre-consultation draft. It does not provide a diagnosis or replace a qualified healthcare professional.
  </p>
</div>
      </div>
    </div>
  );
}
