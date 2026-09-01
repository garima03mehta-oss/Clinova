import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
=========================================================
INDEXED DB
=========================================================
*/

const DB_NAME = "ClinovaDocumentsDB";
const DB_VERSION = 1;
const STORE_NAME = "documents";

const openDocumentsDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getDocumentsFromDB = async () => {
  const db = await openDocumentsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      resolve(request.result || []);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

/*
=========================================================
LANGUAGE
=========================================================
*/

const getLanguage = () => {
  const language =
    localStorage.getItem("clinovaLanguage") || "english";

  return ["hi", "hindi", "हिंदी"].includes(
    language.toLowerCase()
  )
    ? "hi"
    : "en";
};

/*
=========================================================
BACKUP QUESTIONS
=========================================================
*/

const getBackupQuestions = (symptoms) => {
  const text = symptoms.toLowerCase();

  let category = "general";

  if (
    text.includes("chest") ||
    text.includes("heart") ||
    text.includes("छाती") ||
    text.includes("सीने")
  ) {
    category = "chest";
  } else if (
    text.includes("headache") ||
    text.includes("head pain") ||
    text.includes("सिर दर्द")
  ) {
    category = "headache";
  } else if (
    text.includes("fever") ||
    text.includes("temperature") ||
    text.includes("बुखार")
  ) {
    category = "fever";
  } else if (
    text.includes("cough") ||
    text.includes("cold") ||
    text.includes("खांसी") ||
    text.includes("जुकाम")
  ) {
    category = "respiratory";
  } else if (
    text.includes("stomach") ||
    text.includes("abdominal") ||
    text.includes("पेट")
  ) {
    category = "stomach";
  }

  const common = [
    {
      id: "duration",
      question: "When did these symptoms start?",
      type: "text",
    },
    {
      id: "severity",
      question:
        "How would you describe the severity of your symptoms?",
      type: "text",
    },
    {
      id: "frequency",
      question:
        "Are the symptoms constant or do they come and go?",
      type: "text",
    },
    {
      id: "changes",
      question:
        "Have the symptoms become better, worse, or stayed the same?",
      type: "text",
    },
    {
      id: "medication",
      question:
        "Have you taken any medicine for these symptoms?",
      type: "text",
    },
  ];

  const categoryQuestions = {
    chest: [
      {
        id: "chest_location",
        question:
          "Where exactly do you feel the chest discomfort?",
        type: "text",
      },
      {
        id: "breathing",
        question:
          "Have you experienced any difficulty breathing?",
        type: "text",
      },
      {
        id: "activity",
        question:
          "Does the discomfort change with physical activity?",
        type: "text",
      },
    ],

    headache: [
      {
        id: "head_location",
        question:
          "Which part of your head hurts?",
        type: "text",
      },
      {
        id: "head_pattern",
        question:
          "Is the headache continuous or intermittent?",
        type: "text",
      },
      {
        id: "associated",
        question:
          "Have you noticed nausea, vomiting, dizziness, or sensitivity to light?",
        type: "text",
      },
    ],

    fever: [
      {
        id: "temperature",
        question:
          "Do you know your recent temperature?",
        type: "text",
      },
      {
        id: "chills",
        question:
          "Have you experienced chills or sweating?",
        type: "text",
      },
      {
        id: "other_symptoms",
        question:
          "Do you have cough, sore throat, body ache, or other symptoms?",
        type: "text",
      },
    ],

    respiratory: [
      {
        id: "breathing",
        question:
          "Have you experienced difficulty breathing?",
        type: "text",
      },
      {
        id: "phlegm",
        question:
          "Is there mucus or phlegm with the cough?",
        type: "text",
      },
      {
        id: "duration",
        question:
          "How long have you had the cough or cold?",
        type: "text",
      },
    ],

    stomach: [
      {
        id: "location",
        question:
          "Where exactly is the abdominal discomfort?",
        type: "text",
      },
      {
        id: "food",
        question:
          "Does eating or drinking affect the symptoms?",
        type: "text",
      },
      {
        id: "vomiting",
        question:
          "Have you experienced nausea, vomiting, or changes in bowel movements?",
        type: "text",
      },
    ],
  };

  return [
    ...(categoryQuestions[category] || []),
    ...common,
  ];
};

/*
=========================================================
COMPONENT
=========================================================
*/

export default function PreReport() {
  const navigate = useNavigate();

  const language = getLanguage();
  const isHindi = language === "hi";

  const [step, setStep] = useState(1);

  const [symptoms, setSymptoms] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] =
    useState([]);

  const [report, setReport] = useState("");

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [generatingReport, setGeneratingReport] =
    useState(false);

  const [loadingDocuments, setLoadingDocuments] =
    useState(false);

  const [error, setError] = useState("");

  /*
  =========================================================
  TRANSLATIONS
  =========================================================
  */

  const t = isHindi
    ? {
        title: "प्री-कंसल्टेशन रिपोर्ट",
        subtitle:
          "लक्षण साझा करें और डॉक्टर के लिए प्रारंभिक रिपोर्ट तैयार करें।",

        step1: "लक्षण",
        step2: "प्रश्न",
        step3: "दस्तावेज़",
        step4: "रिपोर्ट",

        symptomsTitle:
          "आप अभी किन लक्षणों का अनुभव कर रहे हैं?",

        symptomsPlaceholder:
          "उदाहरण: पिछले 2 दिनों से बुखार और खांसी है...",

        continue: "जारी रखें",

        questionsTitle:
          "कुछ और जानकारी साझा करें",

        questionsDescription:
          "आपके लक्षणों के आधार पर कुछ संबंधित प्रश्न तैयार किए गए हैं।",

        answerPlaceholder:
          "अपना उत्तर लिखें...",

        next: "आगे बढ़ें",

        documentsTitle:
          "क्या आपके पास कोई मेडिकल दस्तावेज़ है?",

        documentsDescription:
          "आप मेडिकल रिपोर्ट, प्रिस्क्रिप्शन या अन्य दस्तावेज़ जोड़ सकते हैं। यह वैकल्पिक है।",

        yesDocuments: "हाँ, दस्तावेज़ जोड़ें",

        noDocuments:
          "मेरे पास कोई दस्तावेज़ नहीं है",

        generate:
          "प्री-रिपोर्ट तैयार करें",

        generating:
          "रिपोर्ट तैयार की जा रही है...",

        reportTitle:
          "प्री-कंसल्टेशन रिपोर्ट",

        aiDraft:
          "AI DRAFT • डॉक्टर द्वारा सत्यापन आवश्यक",

        share:
          "🔐 डॉक्टर के साथ साझा करें",

        dashboard:
          "🏠 डैशबोर्ड",

        back:
          "← वापस",

        noDocumentsFound:
          "कोई सेव किया गया दस्तावेज़ नहीं मिला।",

        chooseDocuments:
          "दस्तावेज़ चुनें",

        selected:
          "चयनित",

        optional:
          "वैकल्पिक",

        error:
          "कुछ समस्या हुई। कृपया दोबारा प्रयास करें।",

        reportWarning:
          "यह रिपोर्ट केवल प्रारंभिक AI-generated draft है। यह diagnosis या treatment recommendation नहीं है। डॉक्टर द्वारा समीक्षा आवश्यक है।",
      }
    : {
        title: "Pre-Consultation Report",
        subtitle:
          "Share your symptoms and prepare a preliminary report for your doctor.",

        step1: "Symptoms",
        step2: "Questions",
        step3: "Documents",
        step4: "Report",

        symptomsTitle:
          "What symptoms are you experiencing?",

        symptomsPlaceholder:
          "Example: I have had fever and cough for the last 2 days...",

        continue: "Continue",

        questionsTitle:
          "Tell us a little more",

        questionsDescription:
          "We generated a few relevant questions based on your symptoms.",

        answerPlaceholder:
          "Type your answer...",

        next: "Continue",

        documentsTitle:
          "Do you have any medical documents?",

        documentsDescription:
          "You can add medical reports, prescriptions or other documents. This is optional.",

        yesDocuments: "Yes, Add Documents",

        noDocuments:
          "No, I don't have documents",

        generate:
          "Generate Pre-Report",

        generating:
          "Generating Report...",

        reportTitle:
          "Pre-Consultation Report",

        aiDraft:
          "AI DRAFT • Doctor Verification Required",

        share:
          "🔐 Share with Doctor",

        dashboard:
          "🏠 Dashboard",

        back:
          "← Back",

        noDocumentsFound:
          "No saved documents found.",

        chooseDocuments:
          "Select Documents",

        selected:
          "Selected",

        optional:
          "Optional",

        error:
          "Something went wrong. Please try again.",

        reportWarning:
          "This is an AI-generated preliminary draft. It is not a diagnosis or treatment recommendation and must be reviewed by a qualified healthcare professional.",
      };

  /*
  =========================================================
  LOAD DOCUMENTS
  =========================================================
  */

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const saved =
        await getDocumentsFromDB();

      const patientId =
        localStorage.getItem(
          "clinovaPatientId"
        );

      const patientDocuments = patientId
        ? saved.filter(
            (document) =>
              !document.patientId ||
              document.patientId === patientId
          )
        : saved;

      setDocuments(patientDocuments);
    } catch (err) {
      console.error(
        "Document loading error:",
        err
      );

      setError(t.error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  /*
  =========================================================
  STEP 1
  GENERATE QUESTIONS
  =========================================================
  */

  const generateQuestions = async () => {
    if (!symptoms.trim()) {
      setError(
        isHindi
          ? "कृपया अपने लक्षण लिखें।"
          : "Please describe your symptoms."
      );

      return;
    }

    try {
      setLoadingQuestions(true);
      setError("");

      const response = await fetch(
        "/api/generateQuestions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            symptoms,
            language,
            languageName: isHindi
              ? "Hindi"
              : "English",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gemini question generation failed"
        );
      }

      const data =
        await response.json();

      let generatedQuestions =
        data?.questions || [];

      /*
       * Gemini response validation
       */

      if (
        !Array.isArray(
          generatedQuestions
        ) ||
        generatedQuestions.length === 0
      ) {
        throw new Error(
          "Invalid Gemini questions"
        );
      }

      generatedQuestions =
        generatedQuestions
          .map((item, index) => ({
            id:
              item.id ||
              `question_${index}`,
            question:
              item.question ||
              item.text ||
              "",
            type: "text",
          }))
          .filter(
            (item) => item.question
          );

      if (
        generatedQuestions.length === 0
      ) {
        throw new Error(
          "No valid questions"
        );
      }

      setQuestions(
        generatedQuestions.slice(0, 8)
      );

      setStep(2);
    } catch (err) {
      /*
       * =====================================================
       * GEMINI BACKUP
       * =====================================================
       */

      console.warn(
        "Gemini unavailable. Using backup questions.",
        err
      );

      const backup =
        getBackupQuestions(symptoms);

      setQuestions(backup);

      setStep(2);
    } finally {
      setLoadingQuestions(false);
    }
  };

  /*
  =========================================================
  ANSWERS
  =========================================================
  */

  const updateAnswer = (
    questionId,
    value
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const continueToDocuments = () => {
    setError("");

    loadDocuments();

    setStep(3);
  };

  /*
  =========================================================
  DOCUMENT SELECTION
  =========================================================
  */

  const toggleDocument = (
    document
  ) => {
    setSelectedDocuments(
      (previous) => {
        const exists =
          previous.some(
            (item) =>
              item.id === document.id
          );

        if (exists) {
          return previous.filter(
            (item) =>
              item.id !== document.id
          );
        }

        return [
          ...previous,
          document,
        ];
      }
    );
  };

  /*
  =========================================================
  GENERATE REPORT
  =========================================================
  */

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      setError("");

      const patientData =
        JSON.parse(
          localStorage.getItem(
            "clinovaPatient"
          ) || "{}"
        );

      const reportDocuments =
        selectedDocuments.map(
          (document) => ({
            id: document.id,
            documentName:
              document.documentName ||
              document.fileName,
            fileName:
              document.fileName,
            fileType:
              document.fileType,
            purpose:
              document.purpose || "",
            createdAt:
              document.createdAt ||
              null,
            analyzed:
              Boolean(
                document.analyzed
              ),
            extracted:
              document.extracted ||
              null,
          })
        );

      const formattedAnswers =
        questions.map(
          (question) => ({
            question:
              question.question,
            answer:
              answers[
                question.id
              ] || "Not provided",
          })
        );

      const response = await fetch(
        "/api/generatePreReport",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            patient: patientData,

            symptoms,

            answers:
              formattedAnswers,

            documents:
              reportDocuments,

            language,

            languageName:
              isHindi
                ? "Hindi"
                : "English",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate report"
        );
      }

      if (!data?.report) {
        throw new Error(
          "No report returned"
        );
      }

      setReport(data.report);

      /*
       * Save locally so ShareAccess
       * can use the generated report.
       */

      localStorage.setItem(
        "clinovaPreReport",
        data.report
      );

      localStorage.setItem(
        "clinovaPreReportData",
        JSON.stringify({
          symptoms,
          answers:
            formattedAnswers,
          documents:
            reportDocuments,
          generatedAt:
            new Date().toISOString(),
        })
      );

      setStep(4);
    } catch (err) {
      console.error(
        "Pre-report generation error:",
        err
      );

      setError(
        err?.message || t.error
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  /*
  =========================================================
  SHARE WITH DOCTOR
  =========================================================
  */

  const shareWithDoctor = () => {
    localStorage.setItem(
      "clinovaShareSource",
      "pre-report"
    );

    navigate("/share-access");
  };

  /*
  =========================================================
  DASHBOARD
  =========================================================
  */

  const goDashboard = () => {
    navigate("/patient/dashboard");
  };

  /*
  =========================================================
  UI
  =========================================================
  */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8F7",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "28px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={goDashboard}
            style={{
              border: "none",
              background: "transparent",
              color: "#0E6E64",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            {t.back}
          </button>

          <p
            style={{
              color: "#0E6E64",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            CLINOVA • PRE-CONSULTATION
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#1F2937",
            }}
          >
            {t.title}
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {t.subtitle}
          </p>

          {/* PROGRESS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "8px",
              marginTop: "25px",
            }}
          >
            {[
              t.step1,
              t.step2,
              t.step3,
              t.step4,
            ].map(
              (item, index) => {
                const active =
                  step >= index + 1;

                return (
                  <div
                    key={item}
                    style={{
                      padding: "9px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      background:
                        active
                          ? "#EAF5F3"
                          : "#F3F4F6",
                      color:
                        active
                          ? "#0E6E64"
                          : "#9CA3AF",
                    }}
                  >
                    {index + 1}.{" "}
                    {item}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#FEF2F2",
              border:
                "1px solid #FCA5A5",
              color: "#B91C1C",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            STEP 1
            ================================================= */}

        {step === 1 && (
          <div
            style={{
              marginTop: "22px",
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                color: "#1F2937",
              }}
            >
              {t.symptomsTitle}
            </h2>

            <textarea
              value={symptoms}
              onChange={(e) =>
                setSymptoms(
                  e.target.value
                )
              }
              placeholder={
                t.symptomsPlaceholder
              }
              rows={7}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "16px",
                borderRadius: "14px",
                border:
                  "1px solid #D1D5DB",
                resize: "vertical",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <button
              onClick={
                generateQuestions
              }
              disabled={
                loadingQuestions
              }
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background:
                  loadingQuestions
                    ? "#9CA3AF"
                    : "#0E6E64",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "16px",
                cursor:
                  loadingQuestions
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loadingQuestions
                ? "🤖 Generating Questions..."
                : t.continue}
            </button>
          </div>
        )}

        {/* =================================================
            STEP 2
            ================================================= */}

        {step === 2 && (
          <div
            style={{
              marginTop: "22px",
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                color: "#1F2937",
              }}
            >
              {t.questionsTitle}
            </h2>

            <p
              style={{
                color: "#6B7280",
              }}
            >
              {t.questionsDescription}
            </p>

            {questions.map(
              (question, index) => (
                <div
                  key={question.id}
                  style={{
                    marginTop: "22px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontWeight: "700",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    {index + 1}.{" "}
                    {question.question}
                  </label>

                  <textarea
                    rows={3}
                    value={
                      answers[
                        question.id
                      ] || ""
                    }
                    onChange={(e) =>
                      updateAnswer(
                        question.id,
                        e.target.value
                      )
                    }
                    placeholder={
                      t.answerPlaceholder
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "13px",
                      borderRadius: "12px",
                      border:
                        "1px solid #D1D5DB",
                      resize: "vertical",
                    }}
                  />
                </div>
              )
            )}

            <button
              onClick={
                continueToDocuments
              }
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background: "#0E6E64",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              {t.next}
            </button>
          </div>
        )}

        {/* =================================================
            STEP 3
            ================================================= */}

        {step === 3 && (
          <div
            style={{
              marginTop: "22px",
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                color: "#1F2937",
              }}
            >
              {t.documentsTitle}
            </h2>

            <p
              style={{
                color: "#6B7280",
              }}
            >
              {t.documentsDescription}
            </p>

            {loadingDocuments ? (
              <p
                style={{
                  color: "#6B7280",
                  marginTop: "25px",
                }}
              >
                Loading documents...
              </p>
            ) : documents.length === 0 ? (
              <div
                style={{
                  marginTop: "20px",
                  padding: "25px",
                  background: "#F9FAFB",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#6B7280",
                }}
              >
                📂 {t.noDocumentsFound}
              </div>
            ) : (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {documents.map(
                  (document) => {
                    const selected =
                      selectedDocuments.some(
                        (item) =>
                          item.id ===
                          document.id
                      );

                    return (
                      <button
                        key={document.id}
                        onClick={() =>
                          toggleDocument(
                            document
                          )
                        }
                        style={{
                          textAlign: "left",
                          padding: "17px",
                          borderRadius: "14px",
                          border: selected
                            ? "2px solid #0E6E64"
                            : "1px solid #E5E7EB",
                          background:
                            selected
                              ? "#EAF5F3"
                              : "#F9FAFB",
                          cursor: "pointer",
                        }}
                      >
                        <strong>
                          📄{" "}
                          {document.documentName ||
                            document.fileName}
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#6B7280",
                            fontSize:
                              "13px",
                          }}
                        >
                          {document.fileName}
                        </p>

                        {selected && (
                          <span
                            style={{
                              display:
                                "inline-block",
                              marginTop:
                                "8px",
                              padding:
                                "4px 9px",
                              borderRadius:
                                "999px",
                              background:
                                "#0E6E64",
                              color:
                                "#FFFFFF",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                            }}
                          >
                            ✓ {t.selected}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}

            <button
              onClick={
                generateReport
              }
              disabled={
                generatingReport
              }
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background:
                  generatingReport
                    ? "#9CA3AF"
                    : "#0E6E64",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "16px",
                cursor:
                  generatingReport
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {generatingReport
                ? t.generating
                : t.generate}
            </button>

            <button
              onClick={() =>
                setStep(2)
              }
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "13px",
                border:
                  "1px solid #D1D5DB",
                borderRadius: "12px",
                background: "#FFFFFF",
                color: "#374151",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t.back}
            </button>
          </div>
        )}

        {/* =================================================
            STEP 4 — A4 DIGITAL REPORT
            ================================================= */}

        {step === 4 && (
          <div
            style={{
              marginTop: "22px",
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                width: "210mm",
                maxWidth: "100%",
                minHeight: "297mm",
                margin: "0 auto",
                padding: "22mm",
                boxSizing: "border-box",
                boxShadow:
                  "0 5px 25px rgba(0,0,0,0.10)",
                borderRadius: "4px",
              }}
            >
              {/* REPORT HEADER */}

              <div
                style={{
                  borderBottom:
                    "2px solid #0E6E64",
                  paddingBottom:
                    "18px",
                  marginBottom:
                    "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        margin: 0,
                        color:
                          "#0E6E64",
                        fontSize:
                          "28px",
                      }}
                    >
                      CLINOVA
                    </h1>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#6B7280",
                        fontSize:
                          "12px",
                      }}
                    >
                      DIGITAL HEALTH
                      PLATFORM
                    </p>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    <strong
                      style={{
                        fontSize:
                          "14px",
                        color:
                          "#374151",
                      }}
                    >
                      {t.reportTitle}
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        fontSize:
                          "11px",
                        color:
                          "#6B7280",
                      }}
                    >
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* REPORT STATUS */}

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background:
                    "#FFF7ED",
                  color:
                    "#9A3412",
                  fontSize:
                    "11px",
                  fontWeight:
                    "700",
                  marginBottom:
                    "20px",
                }}
              >
                {t.aiDraft}
              </div>

              {/* SYMPTOMS */}

              <section
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <h3
                  style={{
                    color:
                      "#1F2937",
                    borderBottom:
                      "1px solid #E5E7EB",
                    paddingBottom:
                      "7px",
                  }}
                >
                  Presenting Symptoms
                </h3>

                <p
                  style={{
                    whiteSpace:
                      "pre-wrap",
                    lineHeight:
                      1.7,
                    color:
                      "#374151",
                    fontSize:
                      "13px",
                  }}
                >
                  {symptoms}
                </p>
              </section>

              {/* QUESTIONS + ANSWERS */}

              <section
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <h3
                  style={{
                    color:
                      "#1F2937",
                    borderBottom:
                      "1px solid #E5E7EB",
                    paddingBottom:
                      "7px",
                  }}
                >
                  Patient Responses
                </h3>

                {questions.map(
                  (question) => (
                    <div
                      key={
                        question.id
                      }
                      style={{
                        marginBottom:
                          "14px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#374151",
                        }}
                      >
                        {question.question}
                      </strong>

                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          fontSize:
                            "12px",
                          color:
                            "#6B7280",
                          lineHeight:
                            1.5,
                        }}
                      >
                        {answers[
                          question.id
                        ] ||
                          "Not provided"}
                      </p>
                    </div>
                  )
                )}
              </section>

              {/* DOCUMENTS */}

              <section
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <h3
                  style={{
                    color:
                      "#1F2937",
                    borderBottom:
                      "1px solid #E5E7EB",
                    paddingBottom:
                      "7px",
                  }}
                >
                  Supporting Documents
                </h3>

                {selectedDocuments.length ===
                0 ? (
                  <p
                    style={{
                      color:
                        "#6B7280",
                      fontSize:
                        "12px",
                    }}
                  >
                    No documents
                    provided.
                  </p>
                ) : (
                  selectedDocuments.map(
                    (document) => (
                      <p
                        key={
                          document.id
                        }
                        style={{
                          fontSize:
                            "12px",
                          margin:
                            "7px 0",
                        }}
                      >
                        📄{" "}
                        {document.documentName ||
                          document.fileName}
                      </p>
                    )
                  )
                )}
              </section>

              {/* AI REPORT */}

              <section
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <h3
                  style={{
                    color:
                      "#1F2937",
                    borderBottom:
                      "1px solid #E5E7EB",
                    paddingBottom:
                      "7px",
                  }}
                >
                  AI-Generated Preliminary Summary
                </h3>

                <div
                  style={{
                    whiteSpace:
                      "pre-wrap",
                    lineHeight:
                      1.7,
                    color:
                      "#374151",
                    fontSize:
                      "12px",
                  }}
                >
                  {report}
                </div>
              </section>

              {/* WARNING */}

              <div
                style={{
                  padding: "13px",
                  background:
                    "#F9FAFB",
                  border:
                    "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize:
                    "10px",
                  color:
                    "#6B7280",
                  lineHeight:
                    1.5,
                }}
              >
                <strong>
                  Important:
                </strong>{" "}
                {t.reportWarning}
              </div>

              {/* FOOTER */}

              <div
                style={{
                  marginTop:
                    "25px",
                  paddingTop:
                    "12px",
                  borderTop:
                    "1px solid #E5E7EB",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "9px",
                  color:
                    "#9CA3AF",
                }}
              >
                <span>
                  Clinova Digital
                  Health Platform
                </span>

                <span>
                  Preliminary Report
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div
              style={{
                maxWidth:
                  "850px",
                margin:
                  "20px auto",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <button
                onClick={
                  shareWithDoctor
                }
                style={{
                  padding: "14px",
                  border: "none",
                  borderRadius:
                    "12px",
                  background:
                    "#0E6E64",
                  color:
                    "#FFFFFF",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                {t.share}
              </button>

              <button
                onClick={() =>
                  setStep(1)
                }
                style={{
                  padding: "14px",
                  border:
                    "1px solid #0E6E64",
                  borderRadius:
                    "12px",
                  background:
                    "#FFFFFF",
                  color:
                    "#0E6E64",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                Create New Report
              </button>

              <button
                onClick={
                  goDashboard
                }
                style={{
                  padding: "14px",
                  border:
                    "1px solid #D1D5DB",
                  borderRadius:
                    "12px",
                  background:
                    "#FFFFFF",
                  color:
                    "#374151",
                  fontWeight:
                    "600",
                  cursor:
                    "pointer",
                }}
              >
                {t.dashboard}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}