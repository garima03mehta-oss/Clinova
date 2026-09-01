import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAIQuestions } from "../../../utils/aiInterviewEngine";

export default function Interview() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("english");
  const [symptomText, setSymptomText] = useState("");
  const [history, setHistory] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [started, setStarted] = useState(false);
  const [showDocumentChoice, setShowDocumentChoice] = useState(false);

  const isHindi = language === "hindi";

  const t = {
    step1: isHindi
      ? "चरण 1 • क्लिनिकल इंटरव्यू"
      : "STEP 1 • CLINICAL INTERVIEW",

    step2: isHindi
      ? "चरण 2 • मेडिकल दस्तावेज़"
      : "STEP 2 • MEDICAL DOCUMENTS",

    tellSymptoms: isHindi
      ? "अपने लक्षणों के बारे में बताएं"
      : "Tell us about your symptoms",

    intro: isHindi
      ? "Clinova आपके लक्षणों के आधार पर कुछ महत्वपूर्ण प्रश्न पूछेगा ताकि आपके डॉक्टर के लिए जानकारी व्यवस्थित की जा सके।"
      : "Clinova will ask a few relevant questions to organize information for your doctor.",

    placeholder: isHindi
      ? "उदाहरण: मुझे कल से सिरदर्द हो रहा है..."
      : "For example: I have been having a headache since yesterday...",

    start: isHindi
      ? "क्लिनिकल इंटरव्यू शुरू करें →"
      : "Start Clinical Interview →",

    preparing: isHindi
      ? "🤖 प्रश्न तैयार किए जा रहे हैं..."
      : "🤖 Preparing questions...",

    smartInterview: isHindi
      ? "CLINOVA • स्मार्ट क्लिनिकल इंटरव्यू"
      : "CLINOVA • ADAPTIVE INTERVIEW",

    clinicalQuestions: isHindi
      ? "क्लिनिकल प्रश्न"
      : "Clinical Questions",

    question: isHindi ? "प्रश्न" : "Question",

    mainComplaint: isHindi
      ? "मुख्य शिकायत:"
      : "Main complaint:",

    answerPlaceholder: isHindi
      ? "अपना उत्तर यहां लिखें..."
      : "Type your answer here...",

    thinking: isHindi
      ? "🤖 अगला प्रश्न तैयार हो रहा है..."
      : "🤖 Thinking...",

    continue: isHindi
      ? "आगे बढ़ें →"
      : "Continue →",

    noAnswer: isHindi
      ? "कृपया अपना उत्तर दर्ज करें।"
      : "Please provide an answer.",

    noSymptom: isHindi
      ? "कृपया पहले अपने मुख्य लक्षण दर्ज करें।"
      : "Please enter your main symptom first.",

    interviewError: isHindi
      ? "इंटरव्यू शुरू नहीं हो सका। कृपया दोबारा प्रयास करें।"
      : "Unable to start the interview. Please try again.",

    fallbackError: isHindi
      ? "AI प्रश्न अभी उपलब्ध नहीं हैं। सामान्य क्लिनिकल प्रश्नों के साथ इंटरव्यू जारी रहेगा।"
      : "AI questions are temporarily unavailable. Using standard clinical questions.",

    answerFallback: isHindi
      ? "AI अभी उपलब्ध नहीं है। सामान्य प्रश्नों के साथ इंटरव्यू जारी रहेगा।"
      : "AI is temporarily unavailable. Continuing with standard questions.",

    documentQuestion: isHindi
      ? "क्या आपके पास कोई मेडिकल दस्तावेज़ है?"
      : "Do you have a medical document?",

    documentDescription: isHindi
      ? "आप अपनी पुरानी मेडिकल रिपोर्ट, प्रिस्क्रिप्शन, लैब रिपोर्ट या स्कैन जोड़ सकते हैं। Clinova आपके दस्तावेज़ का AI की सहायता से विश्लेषण कर सकता है और प्री-कंसल्टेशन रिपोर्ट तैयार करने में मदद कर सकता है।"
      : "You can add a previous medical report, prescription, lab report or scan. Clinova can analyze the document with AI before preparing your pre-consultation report.",

    yesDocument: isHindi
      ? "📄 हाँ, मेरे पास दस्तावेज़ है"
      : "📄 Yes, I have a document",

    uploadDescription: isHindi
      ? "दस्तावेज़ अपलोड करें और चाहें तो Clinova AI से उसका विश्लेषण करवाएं।"
      : "Upload it and optionally analyze it with Clinova AI.",

    noDocument: isHindi
      ? "⏭️ मेरे पास कोई दस्तावेज़ नहीं है"
      : "⏭️ I don't have a document",

    continueDescription: isHindi
      ? "सीधे आगे बढ़ें और अपनी प्री-कंसल्टेशन रिपोर्ट तैयार करें।"
      : "Continue directly and generate your pre-consultation report.",

    optional: isHindi
      ? "दस्तावेज़ अपलोड करना वैकल्पिक है। आप बिना दस्तावेज़ के भी रिपोर्ट तैयार कर सकते हैं।"
      : "Documents are optional. You can generate your report without uploading anything.",

    disclaimer: isHindi
      ? "Clinova द्वारा तैयार की गई जानकारी केवल प्री-कंसल्टेशन ड्राफ्ट है। यह किसी बीमारी का निदान नहीं करती और योग्य स्वास्थ्य विशेषज्ञ की सलाह का विकल्प नहीं है।"
      : "Clinova provides an AI-generated pre-consultation draft. It does not provide a diagnosis or replace a qualified healthcare professional.",
  };

  const fallbackQuestions = isHindi
    ? [
        {
          question: "आप इन लक्षणों को कितने समय से अनुभव कर रहे हैं?",
          type: "text",
          key: "symptom_duration",
          options: [],
        },
        {
          question: "आपके लक्षणों की गंभीरता कैसी है?",
          type: "choice",
          key: "symptom_severity",
          options: ["हल्के", "मध्यम", "गंभीर"],
        },
        {
          question: "समय के साथ आपके लक्षणों में क्या बदलाव आया है?",
          type: "choice",
          key: "symptom_progression",
          options: [
            "बेहतर हो रहे हैं",
            "बदतर हो रहे हैं",
            "लगभग समान हैं",
          ],
        },
        {
          question:
            "क्या कोई अन्य लक्षण या महत्वपूर्ण जानकारी है जो आप चाहते हैं कि डॉक्टर को पता हो?",
          type: "text",
          key: "associated_symptoms",
          options: [],
        },
      ]
    : [
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
      const savedLanguage =
        localStorage.getItem("clinovaLanguage") || "english";

      const normalizedLanguage =
        savedLanguage.toLowerCase() === "hindi"
          ? "hindi"
          : "english";

      setLanguage(normalizedLanguage);

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

    const lowerQuestion =
      questionText.toLowerCase();

    if (
      lowerQuestion.includes("how long") ||
      lowerQuestion.includes("since when") ||
      lowerQuestion.includes("how many days") ||
      lowerQuestion.includes("how many weeks") ||
      lowerQuestion.includes("how many months") ||
      lowerQuestion.includes("कितने समय") ||
      lowerQuestion.includes("कब से")
    ) {
      type = "text";
    }

    if (
      lowerQuestion.includes("severity") ||
      lowerQuestion.includes("how severe") ||
      lowerQuestion.includes("how bad") ||
      lowerQuestion.includes("गंभीरता")
    ) {
      type = "choice";
    }

    if (
      lowerQuestion.includes("getting better") ||
      lowerQuestion.includes("getting worse") ||
      lowerQuestion.includes("changed over time") ||
      lowerQuestion.includes("changing over time") ||
      lowerQuestion.includes("बेहतर") ||
      lowerQuestion.includes("बदतर") ||
      lowerQuestion.includes("समय के साथ")
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
      lowerQuestion.includes("how bad") ||
      lowerQuestion.includes("गंभीरता")
    ) {
      type = "choice";

      options = isHindi
        ? ["हल्के", "मध्यम", "गंभीर"]
        : ["Mild", "Moderate", "Severe"];
    }

    if (
      lowerQuestion.includes("getting better") ||
      lowerQuestion.includes("getting worse") ||
      lowerQuestion.includes("changed over time") ||
      lowerQuestion.includes("changing over time") ||
      lowerQuestion.includes("बेहतर") ||
      lowerQuestion.includes("बदतर") ||
      lowerQuestion.includes("समय के साथ")
    ) {
      type = "choice";

      options = isHindi
        ? [
            "बेहतर हो रहे हैं",
            "बदतर हो रहे हैं",
            "लगभग समान हैं",
          ]
        : [
            "Getting better",
            "Getting worse",
            "About the same",
          ];
    }

    if (type === "yesno") {
      options = isHindi ? ["हाँ", "नहीं"] : ["Yes", "No"];
    }

    if (type === "choice" && options.length < 2) {
      type = "text";
      options = [];
    }

    return {
      question:
        questionText ||
        (isHindi
          ? "कृपया अपने लक्षणों के बारे में बताएं।"
          : "Please describe your symptoms."),
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
      setError(t.noSymptom);
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
          initialHistory,
          language
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
          nextQuestion =
            normalizeQuestion(fallback);
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
        setError(t.fallbackError);
      } else {
        setError(t.interviewError);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError(t.noAnswer);
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
          updatedHistory,
          language
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
          nextQuestion =
            normalizeQuestion(fallback);
        }
      }

      const answeredFollowUps =
        Object.keys(updatedHistory).filter(
          (key) => key !== "chiefComplaint"
        ).length;

      if (
        answeredFollowUps >= 4 ||
        !nextQuestion
      ) {
        finishInterview(updatedHistory);
        return;
      }

      setCurrentQuestion(nextQuestion);
      setQuestionNumber(
        (prev) => prev + 1
      );
      setAnswer("");
    } catch (err) {
      console.error(
        "Interview answer error:",
        err
      );

      const fallback =
        getNextFallbackQuestion(
          updatedHistory
        );

      if (fallback) {
        const normalized =
          normalizeQuestion(fallback);

        setCurrentQuestion(normalized);
        setQuestionNumber(
          (prev) => prev + 1
        );
        setAnswer("");
        setError(t.answerFallback);
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
            {t.step2}
          </p>

          <h1
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            {t.documentQuestion}
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {t.documentDescription}
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
                {t.yesDocument}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#6B7280",
                  lineHeight: 1.5,
                }}
              >
                {t.uploadDescription}
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
                {t.noDocument}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#6B7280",
                }}
              >
                {t.continueDescription}
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
            {t.optional}
          </p>
        </div>
      </div>
    );
  }

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
            {t.step1}
          </p>

          <h1
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            {t.tellSymptoms}
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {t.intro}
          </p>

          <textarea
            value={symptomText}
            onChange={(e) =>
              setSymptomText(e.target.value)
            }
            placeholder={t.placeholder}
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
              ? t.preparing
              : t.start}
          </button>
        </div>
      </div>
    );
  }

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
          {t.smartInterview}
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
            {t.clinicalQuestions}
          </h1>

          <span
            style={{
              fontSize: "13px",
              color: "#6B7280",
              whiteSpace: "nowrap",
            }}
          >
            {t.question} {questionNumber}
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
          <strong>{t.mainComplaint}</strong>{" "}
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
                placeholder={t.answerPlaceholder}
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
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
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
                        fontWeight: "700",
                        fontSize: "15px",
                        cursor: "pointer",
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
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
              disabled={
                !answer.trim() || loading
              }
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
                ? t.thinking
                : t.continue}
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
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}