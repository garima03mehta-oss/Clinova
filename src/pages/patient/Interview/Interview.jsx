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
  const [showDocumentChoice, setShowDocumentChoice] = useState(false);

  const fallbackQuestions = [
    {
      question: "How long have you been experiencing these symptoms?",
      type: "text",
      key: "symptom_duration",
      options: [],
    },
    {
      question: "How would you describe the severity of your symptoms?",
      type: "choice",
      key: "symptom_severity",
      options: ["Mild", "Moderate", "Severe"],
    },
    {
      question: "How are your symptoms changing over time?",
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

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("clinovaInterviewHistory") || "{}"
      );

      const savedSymptom =
        localStorage.getItem("clinovaSymptoms") || "";

      setHistory(savedHistory);

      setSymptomText(
        savedHistory.chiefComplaint || savedSymptom
      );
    } catch (err) {
      console.error("Unable to load interview data:", err);
    }
  }, []);

  const normalizeQuestion = (question) => {
    if (!question) return null;

    let type = question.type || "text";

    const questionText = String(
      question.question || ""
    ).trim();

    const lowerQuestion = questionText.toLowerCase();

    if (
      lowerQuestion.includes("how long") ||
      lowerQuestion.includes("since when") ||
      lowerQuestion.includes("how many days") ||
      lowerQuestion.includes("how many weeks") ||
      lowerQuestion.includes("how many months")
    ) {
      type = "text";
    }

    if (
      lowerQuestion.includes("severity") ||
      lowerQuestion.includes("how severe") ||
      lowerQuestion.includes("how bad")
    ) {
      type = "choice";
    }

    if (
      lowerQuestion.includes("getting better") ||
      lowerQuestion.includes("getting worse") ||
      lowerQuestion.includes("changed over time") ||
      lowerQuestion.includes("changing over time")
    ) {
      type = "choice";
    }

    if (!["text", "yesno", "choice"].includes(type)) {
      type = "text";
    }

    let options = Array.isArray(question.options)
      ? question.options
      : [];

    if (
      lowerQuestion.includes("severity") ||
      lowerQuestion.includes("how severe") ||
      lowerQuestion.includes("how bad")
    ) {
      type = "choice";
      options = ["Mild", "Moderate", "Severe"];
    }

    if (
      lowerQuestion.includes("getting better") ||
      lowerQuestion.includes("getting worse") ||
      lowerQuestion.includes("changed over time") ||
      lowerQuestion.includes("changing over time")
    ) {
      type = "choice";

      options = [
        "Getting better",
        "Getting worse",
        "About the same",
      ];
    }

    if (type === "yesno") {
      options = ["Yes", "No"];
    }

    if (type === "choice" && options.length < 2) {
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

  const getNextFallbackQuestion = (currentHistory) => {
    return fallbackQuestions.find(
      (question) =>
        currentHistory[question.key] === undefined
    );
  };

  /*
   * IMPORTANT:
   * Interview खत्म होने के बाद अब सीधे documents पर नहीं जाएगा.
   * पहले document choice screen दिखेगी.
   */
  const finishInterview = (finalHistory) => {
    localStorage.setItem(
      "clinovaInterviewHistory",
      JSON.stringify(finalHistory)
    );

    setHistory(finalHistory);
    setCurrentQuestion(null);
    setShowDocumentChoice(true);
  };

  const handleDocumentChoice = (choice) => {
    /*
     * Clear previous free-report document state
     * when user explicitly chooses no document.
     */
    if (choice === "none") {
      localStorage.setItem(
        "clinovaDocuments",
        JSON.stringify([])
      );

      localStorage.setItem(
        "clinovaFreeReportMode",
        "true"
      );

      navigate("/pre-report");
      return;
    }

    /*
     * User wants to upload a document.
     * DocumentUpload handles actual upload/AI analysis.
     */
    localStorage.setItem(
      "clinovaFreeReportMode",
      "true"
    );

    localStorage.setItem(
      "clinovaDocumentFlow",
      "pre-report"
    );

    navigate("/documents");
  };

  const startInterview = async () => {
    if (!symptomText.trim()) {
      setError("Please enter your main symptom first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const initialHistory = {
        ...history,
        chiefComplaint: symptomText.trim(),
      };

      setHistory(initialHistory);

      localStorage.setItem(
        "clinovaInterviewHistory",
        JSON.stringify(initialHistory)
      );

      localStorage.setItem(
        "clinovaSymptoms",
        symptomText.trim()
      );

      let result = null;

      try {
        result = await getAIQuestions(
          symptomText.trim(),
          initialHistory
        );

        console.log("Gemini first response:", result);
      } catch (geminiError) {
        console.warn(
          "Gemini unavailable. Using fallback questions.",
          geminiError
        );
      }

      let nextQuestion = null;

      if (
        result &&
        Array.isArray(result.followUpQuestions) &&
        result.followUpQuestions.length > 0
      ) {
        nextQuestion = normalizeQuestion(
          result.followUpQuestions[0]
        );
      }

      if (!nextQuestion) {
        const fallback =
          getNextFallbackQuestion(initialHistory);

        if (fallback) {
          nextQuestion = normalizeQuestion(fallback);
        }
      }

      if (!nextQuestion) {
        finishInterview(initialHistory);
        return;
      }

      setCurrentQuestion(nextQuestion);
      setQuestionNumber(1);
      setStarted(true);
      setAnswer("");
    } catch (err) {
      console.error("AI Interview Error:", err);

      const fallback =
        getNextFallbackQuestion(history);

      if (fallback) {
        const normalized =
          normalizeQuestion(fallback);

        setCurrentQuestion(normalized);
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

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError("Please provide an answer.");
      return;
    }

    setLoading(true);
    setError("");

    const updatedHistory = {
      ...history,
      [currentQuestion.key]: trimmedAnswer,
    };

    setHistory(updatedHistory);

    localStorage.setItem(
      "clinovaInterviewHistory",
      JSON.stringify(updatedHistory)
    );

    try {
      let result = null;

      try {
        result = await getAIQuestions(
          symptomText,
          updatedHistory
        );

        console.log("Gemini next response:", result);
      } catch (geminiError) {
        console.warn(
          "Gemini unavailable for next question. Using fallback.",
          geminiError
        );
      }

      let nextQuestion = null;

      if (
        result &&
        Array.isArray(result.followUpQuestions) &&
        result.followUpQuestions.length > 0
      ) {
        nextQuestion = normalizeQuestion(
          result.followUpQuestions[0]
        );
      }

      if (
        nextQuestion &&
        updatedHistory[nextQuestion.key] !== undefined
      ) {
        nextQuestion = null;
      }

      if (!nextQuestion) {
        const fallback =
          getNextFallbackQuestion(updatedHistory);

        if (fallback) {
          nextQuestion = normalizeQuestion(fallback);
        }
      }

      const answeredFollowUps =
        Object.keys(updatedHistory).filter(
          (key) => key !== "chiefComplaint"
        ).length;

      /*
       * Maximum 4 follow-up questions.
       * After that, show document choice.
       */
      if (
        answeredFollowUps >= 4 ||
        !nextQuestion
      ) {
        finishInterview(updatedHistory);
        return;
      }

      setCurrentQuestion(nextQuestion);
      setQuestionNumber((prev) => prev + 1);
      setAnswer("");
    } catch (err) {
      console.error("Interview answer error:", err);

      const fallback =
        getNextFallbackQuestion(updatedHistory);

      if (fallback) {
        const normalized =
          normalizeQuestion(fallback);

        setCurrentQuestion(normalized);
        setQuestionNumber((prev) => prev + 1);
        setAnswer("");

        setError(
          "AI is temporarily unavailable. Continuing with standard questions."
        );
      } else {
        finishInterview(updatedHistory);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      currentQuestion?.type === "text"
    ) {
      event.preventDefault();
      submitAnswer();
    }
  };

  /*
   * DOCUMENT CHOICE SCREEN
   */
  if (showDocumentChoice) {
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
            padding: "35px",
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
            STEP 2 • MEDICAL DOCUMENTS
          </p>

          <h1
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            Do you have a medical document?
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            You can add a previous medical report,
            prescription, lab report or scan. Clinova
            can analyze the document with AI before
            preparing your pre-consultation report.
          </p>

          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "28px",
            }}
          >
            <button
              onClick={() =>
                handleDocumentChoice("upload")
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border: "2px solid #0E6E64",
                background: "#EAF5F3",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "17px",
                  color: "#084C44",
                }}
              >
                📄 Yes, I have a document
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#6B7280",
                  lineHeight: 1.5,
                }}
              >
                Upload it and optionally analyze it
                with Clinova AI.
              </span>
            </button>

            <button
              onClick={() =>
                handleDocumentChoice("none")
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "17px",
                  color: "#1F2937",
                }}
              >
                ⏭️ I don't have a document
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#6B7280",
                }}
              >
                Continue directly and generate my
                pre-consultation report.
              </span>
            </button>
          </div>

          <p
            style={{
              marginTop: "25px",
              textAlign: "center",
              color: "#6B7280",
              fontSize: "12px",
            }}
          >
            Documents are optional. You can generate
            your report without uploading anything.
          </p>
        </div>
      </div>
    );
  }

  /*
   * START SCREEN
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
            Clinova will ask a few relevant questions
            to organize information for your doctor.
          </p>

          <textarea
            value={symptomText}
            onChange={(e) =>
              setSymptomText(e.target.value)
            }
            placeholder="For example: I have been having a headache since yesterday..."
            rows={5}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #D1D5DB",
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
            onClick={startInterview}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background:
                loading ? "#9CA3AF" : "#0E6E64",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "700",
              cursor:
                loading ? "not-allowed" : "pointer",
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
   * INTERVIEW SCREEN
   */
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
          CLINOVA • ADAPTIVE INTERVIEW
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
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

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "#EAF5F3",
            color: "#084C44",
          }}
        >
          <strong>Main complaint:</strong>{" "}
          {symptomText}
        </div>

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

            {currentQuestion.type === "text" && (
              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                rows={4}
                autoFocus
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #D1D5DB",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            )}

            {currentQuestion.type === "yesno" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setAnswer(option)
                    }
                    style={{
                      padding: "15px",
                      borderRadius: "12px",
                      border:
                        answer === option
                          ? "2px solid #0E6E64"
                          : "1px solid #D1D5DB",
                      background:
                        answer === option
                          ? "#EAF5F3"
                          : "#FFFFFF",
                      color: "#1F2937",
                      fontWeight: "700",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "choice" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                {currentQuestion.options.map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setAnswer(option)
                      }
                      style={{
                        padding: "15px",
                        borderRadius: "12px",
                        border:
                          answer === option
                            ? "2px solid #0E6E64"
                            : "1px solid #D1D5DB",
                        background:
                          answer === option
                            ? "#EAF5F3"
                            : "#FFFFFF",
                        color: "#1F2937",
                        fontWeight: "600",
                        fontSize: "15px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}

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
              onClick={submitAnswer}
              disabled={!answer.trim() || loading}
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background:
                  !answer.trim() || loading
                    ? "#9CA3AF"
                    : "#0E6E64",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "700",
                cursor:
                  !answer.trim() || loading
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

        <p
          style={{
            marginTop: "28px",
            color: "#6B7280",
            fontSize: "12px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Clinova provides an AI-generated
          pre-consultation draft. It does not provide
          a diagnosis or replace a qualified
          healthcare professional.
        </p>
      </div>
    </div>
  );
}