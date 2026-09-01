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
      : "Clinova will ask a few relevant questions based on your symptoms to organize useful information for your doctor.",

    placeholder: isHindi
      ? "उदाहरण: मुझे कल से सिरदर्द हो रहा है..."
      : "For example: I have been having a headache since yesterday...",

    start: isHindi
      ? "क्लिनिकल इंटरव्यू शुरू करें →"
      : "Start Clinical Interview →",

    preparing: isHindi
      ? "🤖 प्रश्न तैयार किए जा रहे हैं..."
      : "🤖 Preparing question...",

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
      : "🤖 Preparing next question...",

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
      ? "AI प्रश्न उपलब्ध नहीं है। सामान्य क्लिनिकल प्रश्न के साथ इंटरव्यू जारी रहेगा।"
      : "AI question is temporarily unavailable. A standard clinical question will be used.",

    documentQuestion: isHindi
      ? "क्या आपके पास कोई मेडिकल दस्तावेज़ है?"
      : "Do you have a medical document?",

    documentDescription: isHindi
      ? "आप अपनी पुरानी मेडिकल रिपोर्ट, प्रिस्क्रिप्शन, लैब रिपोर्ट या स्कैन जोड़ सकते हैं।"
      : "You can add a previous medical report, prescription, lab report or scan.",

    yesDocument: isHindi
      ? "📄 हाँ, मेरे पास दस्तावेज़ है"
      : "📄 Yes, I have a document",

    uploadDescription: isHindi
      ? "दस्तावेज़ अपलोड करें और फिर अपनी प्री-कंसल्टेशन रिपोर्ट तैयार करें।"
      : "Upload your document and then generate your pre-consultation report.",

    noDocument: isHindi
      ? "⏭️ मेरे पास कोई दस्तावेज़ नहीं है"
      : "⏭️ I don't have a document",

    continueDescription: isHindi
      ? "बिना दस्तावेज़ के सीधे प्री-कंसल्टेशन रिपोर्ट तैयार करें।"
      : "Continue directly and generate your pre-consultation report.",

    optional: isHindi
      ? "दस्तावेज़ वैकल्पिक हैं। आप बिना दस्तावेज़ के भी रिपोर्ट तैयार कर सकते हैं।"
      : "Documents are optional. You can generate the report without documents.",

    disclaimer: isHindi
      ? "Clinova द्वारा तैयार की गई जानकारी केवल प्री-कंसल्टेशन ड्राफ्ट है। यह निदान या उपचार की सलाह नहीं है।"
      : "Clinova provides an AI-assisted pre-consultation draft. It is not a diagnosis or treatment recommendation.",
  };

  /*
   * ---------------------------------------------------------
   * FALLBACK QUESTIONS
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * These questions are used ONLY when Gemini fails,
   * returns invalid data, or returns no usable question.
   */

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
            "क्या आपके मुख्य लक्षण के साथ कोई अन्य लक्षण भी हो रहे हैं?",
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

  /*
   * ---------------------------------------------------------
   * LOAD SAVED DATA
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * NORMALIZE GEMINI QUESTION
   * ---------------------------------------------------------
   */

  const normalizeQuestion = (question) => {
    if (!question) return null;

    const questionText = String(
      question.question || ""
    ).trim();

    if (!questionText) return null;

    let type = question.type || "text";

    if (!["text", "yesno", "choice"].includes(type)) {
      type = "text";
    }

    let options = Array.isArray(question.options)
      ? question.options
          .map((option) => String(option).trim())
          .filter(Boolean)
      : [];

    const lowerQuestion = questionText.toLowerCase();

    /*
     * Duration questions should be text.
     */

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
      options = [];
    }

    /*
     * Severity questions should be choice.
     */

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

    /*
     * Progression questions should be choice.
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

    /*
     * Yes / No.
     */

    if (type === "yesno") {
      options = isHindi
        ? ["हाँ", "नहीं"]
        : ["Yes", "No"];
    }

    /*
     * Choice must have at least 2 options.
     */

    if (type === "choice" && options.length < 2) {
      type = "text";
      options = [];
    }

    /*
     * Language safety check.
     */

    const hasHindi = /[\u0900-\u097F]/.test(
      questionText
    );

    if (isHindi && !hasHindi) {
      return null;
    }

    if (!isHindi && hasHindi) {
      return null;
    }

    return {
      question: questionText,
      type,
      key:
        question.key ||
        `gemini_question_${Date.now()}`,
      options,
    };
  };

  /*
   * ---------------------------------------------------------
   * GET NEXT FALLBACK QUESTION
   * ---------------------------------------------------------
   */

  const getNextFallbackQuestion = (currentHistory) => {
    return fallbackQuestions.find(
      (question) =>
        currentHistory[question.key] === undefined
    );
  };

  /*
   * ---------------------------------------------------------
   * FINISH INTERVIEW
   * ---------------------------------------------------------
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

  /*
   * ---------------------------------------------------------
   * DOCUMENT CHOICE
   * ---------------------------------------------------------
   */

  const handleDocumentChoice = (choice) => {
    localStorage.setItem(
      "clinovaFreeReportMode",
      "true"
    );

    if (choice === "none") {
      localStorage.setItem(
        "clinovaDocuments",
        JSON.stringify([])
      );

      navigate("/pre-report");
      return;
    }

    localStorage.setItem(
      "clinovaDocumentFlow",
      "pre-report"
    );

    navigate("/documents");
  };

  /*
   * ---------------------------------------------------------
   * START INTERVIEW
   * ---------------------------------------------------------
   */

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

      /*
       * FIRST TRY GEMINI.
       *
       * Fallback is NOT selected here unless Gemini
       * actually fails or gives invalid response.
       */

      let result = null;

      try {
        result = await getAIQuestions(
          symptomText.trim(),
          initialHistory,
          language
        );

        console.log(
          "Gemini first response:",
          result
        );
      } catch (geminiError) {
        console.warn(
          "Gemini failed. Using fallback question.",
          geminiError
        );
      }

      let nextQuestion = null;

      /*
       * USE GEMINI QUESTION ONLY IF VALID.
       */

      if (
        result &&
        Array.isArray(result.followUpQuestions) &&
        result.followUpQuestions.length > 0
      ) {
        const geminiQuestion =
          normalizeQuestion(
            result.followUpQuestions[0]
          );

        if (
          geminiQuestion &&
          initialHistory[
            geminiQuestion.key
          ] === undefined
        ) {
          nextQuestion = geminiQuestion;
        }
      }

      /*
       * ONLY NOW USE FALLBACK.
       */

      if (!nextQuestion) {
        const fallback =
          getNextFallbackQuestion(
            initialHistory
          );

        if (fallback) {
          nextQuestion =
            normalizeQuestion(fallback);

          setError(t.fallbackError);
        }
      }

      /*
       * No question means interview complete.
       */

      if (!nextQuestion) {
        finishInterview(initialHistory);
        return;
      }

      setCurrentQuestion(nextQuestion);
      setQuestionNumber(1);
      setStarted(true);
      setAnswer("");
    } catch (err) {
      console.error(
        "AI Interview Error:",
        err
      );

      const fallback =
        getNextFallbackQuestion(
          {
            ...history,
            chiefComplaint:
              symptomText.trim(),
          }
        );

      if (fallback) {
        setCurrentQuestion(
          normalizeQuestion(fallback)
        );

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

  /*
   * ---------------------------------------------------------
   * SUBMIT ANSWER
   * ---------------------------------------------------------
   */

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const trimmedAnswer =
      answer.trim();

    if (!trimmedAnswer) {
      setError(t.noAnswer);
      return;
    }

    setLoading(true);
    setError("");

    const updatedHistory = {
      ...history,
      [currentQuestion.key]:
        trimmedAnswer,
    };

    setHistory(updatedHistory);

    localStorage.setItem(
      "clinovaInterviewHistory",
      JSON.stringify(updatedHistory)
    );

    try {
      /*
       * Ask Gemini for the NEXT question.
       */

      let result = null;

      try {
        result = await getAIQuestions(
          symptomText,
          updatedHistory,
          language
        );

        console.log(
          "Gemini next response:",
          result
        );
      } catch (geminiError) {
        console.warn(
          "Gemini failed for next question. Using fallback.",
          geminiError
        );
      }

      let nextQuestion = null;

      /*
       * Gemini question first.
       */

      if (
        result &&
        Array.isArray(
          result.followUpQuestions
        ) &&
        result.followUpQuestions.length > 0
      ) {
        const geminiQuestion =
          normalizeQuestion(
            result.followUpQuestions[0]
          );

        if (
          geminiQuestion &&
          updatedHistory[
            geminiQuestion.key
          ] === undefined
        ) {
          nextQuestion =
            geminiQuestion;
        }
      }

      /*
       * FALLBACK ONLY IF GEMINI DID NOT
       * PROVIDE A VALID QUESTION.
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

          setError(t.fallbackError);
        }
      }

      /*
       * Maximum 4 follow-up questions.
       */

      const answeredFollowUps =
        Object.keys(
          updatedHistory
        ).filter(
          (key) =>
            key !== "chiefComplaint" &&
            key !== "symptomText" &&
            key !== "symptoms"
        ).length;

      if (
        answeredFollowUps >= 4 ||
        !nextQuestion
      ) {
        finishInterview(
          updatedHistory
        );
        return;
      }

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

      const fallback =
        getNextFallbackQuestion(
          updatedHistory
        );

      if (fallback) {
        setCurrentQuestion(
          normalizeQuestion(
            fallback
          )
        );

        setQuestionNumber(
          (prev) => prev + 1
        );

        setAnswer("");
        setError(
          t.fallbackError
        );
      } else {
        finishInterview(
          updatedHistory
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ENTER KEY
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
   * DOCUMENT SCREEN
   * ---------------------------------------------------------
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
                handleDocumentChoice(
                  "upload"
                )
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border:
                  "2px solid #0E6E64",
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
                handleDocumentChoice(
                  "none"
                )
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border:
                  "1px solid #D1D5DB",
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
                  lineHeight: 1.5,
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
              setSymptomText(
                e.target.value
              )
            }
            placeholder={t.placeholder}
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
            onClick={startInterview}
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
              ? t.preparing
              : t.start}
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * QUESTION SCREEN
   * ---------------------------------------------------------
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
          {t.smartInterview}
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
            {t.clinicalQuestions}
          </h1>

          <span
            style={{
              fontSize: "13px",
              color: "#6B7280",
              whiteSpace: "nowrap",
            }}
          >
            {t.question}{" "}
            {questionNumber}
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
          <strong>
            {t.mainComplaint}
          </strong>{" "}
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
                placeholder={
                  t.answerPlaceholder
                }
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

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius:
                    "10px",
                  background:
                    "#FEF2F2",
                  color: "#B91C1C",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

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
                borderRadius:
                  "12px",
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
