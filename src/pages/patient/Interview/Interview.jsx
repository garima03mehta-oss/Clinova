import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { getAIQuestions } from "../../../utils/aiInterviewEngine";
import { getCompletenessScore } from "../../../utils/completenessScore";
import { checkPriority } from "../../../utils/priorityEngine";

export default function Interview() {
  const navigate = useNavigate();

  const [symptomText, setSymptomText] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState({});
  const [priorityAlert, setPriorityAlert] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const completeness = getCompletenessScore({
    chiefComplaint: symptomText,
    ...answers,
  });

  // START AI INTERVIEW
  const startInterview = async () => {
    if (!symptomText.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const initialHistory = {
        chiefComplaint: symptomText.trim(),
      };

      const data = await getAIQuestions(
        symptomText.trim(),
        initialHistory
      );

      console.log("Gemini first response:", data);

      const nextQuestion = data?.followUpQuestions?.[0];

      if (!nextQuestion) {
        await finishInterview(initialHistory, null);
        return;
      }

      setHistory(initialHistory);
      setCurrentQuestion(nextQuestion);
      setQuestionCount(1);
    } catch (err) {
      console.error("AI Interview Error:", err);

      setError(
        err.message || "Unable to generate the question."
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLE ANSWER
  const handleAnswer = async (value) => {
    if (!currentQuestion || loading) return;

    setError("");
    setLoading(true);

    try {
      const questionKey =
        currentQuestion.key || `question_${questionCount}`;

      const updatedAnswers = {
        ...answers,
        [questionKey]: value,
      };

      const updatedHistory = {
        ...history,
        [questionKey]: value,
      };

      setAnswers(updatedAnswers);
      setHistory(updatedHistory);

      const priority = checkPriority({
        chestPain: symptomText
          .toLowerCase()
          .includes("chest pain"),
        ...updatedAnswers,
      });

      if (priority.flagged) {
        setPriorityAlert(priority.reason);
      }

      // Maximum 3 AI questions
      if (questionCount >= 3) {
        await finishInterview(updatedHistory, priority);
        return;
      }

      const data = await getAIQuestions(
        symptomText.trim(),
        updatedHistory
      );

      console.log("Gemini next response:", data);

      const nextQuestion =
        data?.followUpQuestions?.[0];

      if (!nextQuestion) {
        await finishInterview(
          updatedHistory,
          priority
        );
        return;
      }

      setCurrentQuestion(nextQuestion);
      setQuestionCount(questionCount + 1);
    } catch (err) {
      console.error(
        "Adaptive Question Error:",
        err
      );

      setError(
        err.message ||
          "Unable to generate the next question."
      );
    } finally {
      setLoading(false);
    }
  };

  // FINISH INTERVIEW
  const finishInterview = async (
    finalHistory,
    priority
  ) => {
    try {
      const patientId =
        localStorage.getItem(
          "clinovaPatientId"
        );

      if (patientId) {
        await setDoc(
          doc(
            db,
            "clinicalHistories",
            patientId
          ),
          {
            chiefComplaint:
              symptomText.trim() ||
              finalHistory.chiefComplaint,

            answers: finalHistory,

            completeness,

            priorityFlag:
              priority?.flagged
                ? priority.reason
                : priorityAlert || null,

            careSystem:
              localStorage.getItem(
                "clinovaCareSystem"
              ),

            interviewCompleted: true,

            createdAt: Date.now(),
          }
        );
      }

      setCurrentQuestion(null);
      setInterviewCompleted(true);
    } catch (err) {
      console.error(
        "Saving clinical history failed:",
        err
      );

      setError(
        "Could not save your interview. Please try again."
      );
    }
  };

  // INTERVIEW COMPLETION SCREEN
  if (interviewCompleted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F6F8F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "36px",
            }}
          >
            ✓
          </div>

          <h1
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            AI Interview Completed
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.7,
            }}
          >
            Your symptoms and answers have been
            recorded successfully.
          </p>

          {priorityAlert && (
            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "12px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                textAlign: "left",
              }}
            >
              <strong
                style={{
                  color: "#DC2626",
                }}
              >
                ⚠️ Attention
              </strong>

              <p
                style={{
                  color: "#B91C1C",
                  marginBottom: 0,
                }}
              >
                {priorityAlert}
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "28px",
            }}
          >
            <button
              onClick={() =>
                navigate("/documents")
              }
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background: "#0E6E64",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              📄 Upload Medical Documents
            </button>

            <button
              onClick={() =>
                navigate("/pre-report")
              }
              style={{
                width: "100%",
                padding: "15px",
                border: "2px solid #0E6E64",
                borderRadius: "12px",
                background: "#FFFFFF",
                color: "#0E6E64",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✨ Generate Pre-Report
            </button>
          </div>

          <p
            style={{
              marginTop: "22px",
              color: "#9CA3AF",
              fontSize: "12px",
            }}
          >
            AI-generated information is a draft
            and should be verified by a qualified
            doctor.
          </p>
        </div>
      </div>
    );
  }

  // MAIN INTERVIEW UI
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8F7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "32px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            color: "#1F2937",
            marginBottom: "8px",
          }}
        >
          AI Clinical Interview
        </h1>

        <p
          style={{
            color: "#6B7280",
            lineHeight: 1.6,
          }}
        >
          Tell Clinova what you are experiencing.
          Your questions will adapt to your symptoms.
        </p>

        {!currentQuestion && (
          <>
            <label
              style={{
                display: "block",
                marginTop: "24px",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              What symptoms are you experiencing?
            </label>

            <textarea
              value={symptomText}
              onChange={(e) =>
                setSymptomText(e.target.value)
              }
              placeholder="Example: I have fever and headache since yesterday..."
              rows={5}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                resize: "vertical",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p
                style={{
                  color: "#DC2626",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={startInterview}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background: "#0E6E64",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Generating..."
                : "Start AI Interview"}
            </button>
          </>
        )}

        {currentQuestion && (
          <>
            <div
              style={{
                marginTop: "24px",
              }}
            >
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "13px",
                }}
              >
                Question {questionCount} of 3
              </p>

              <div
                style={{
                  height: "6px",
                  background: "#E5E7EB",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      (questionCount / 3) * 100,
                      100
                    )}%`,
                    height: "100%",
                    background: "#0E6E64",
                  }}
                />
              </div>
            </div>

            <p
              style={{
                marginTop: "28px",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1F2937",
                lineHeight: "1.5",
              }}
            >
              {currentQuestion?.question ||
                "Please answer the question below."}
            </p>

            {priorityAlert && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #DC2626",
                  borderRadius: "12px",
                  padding: "12px",
                  marginTop: "16px",
                }}
              >
                <p
                  style={{
                    color: "#DC2626",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  ⚠️ {priorityAlert}
                </p>
              </div>
            )}

            {error && (
              <p
                style={{
                  color: "#DC2626",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() =>
                  handleAnswer(true)
                }
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #0E6E64",
                  background: "#0E6E64",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>

              <button
                onClick={() =>
                  handleAnswer(false)
                }
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #0E6E64",
                  background: "white",
                  color: "#0E6E64",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>

            {loading && (
              <p
                style={{
                  textAlign: "center",
                  color: "#6B7280",
                  marginTop: "16px",
                }}
              >
                Clinova is preparing your next
                question...
              </p>
            )}

            <p
              style={{
                marginTop: "24px",
                color: "#6B7280",
                fontSize: "13px",
              }}
            >
              History completeness: {completeness}%
            </p>
          </>
        )}
      </div>
    </div>
  );
}