import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
 * =========================================================
 * INDEXED DB
 * =========================================================
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

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
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
 * =========================================================
 * LANGUAGE HELPER
 * =========================================================
 */

const getLanguage = () => {
  const language =
    localStorage.getItem("clinovaLanguage") || "en";

  const normalized = language
    .toString()
    .toLowerCase()
    .trim();

  return ["hi", "hindi", "हिंदी"].includes(normalized)
    ? "hi"
    : "en";
};

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function PreReport() {
  const navigate = useNavigate();

  const [language] = useState(getLanguage);

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [generating, setGenerating] = useState(false);

  const [report, setReport] = useState("");

  const [showReport, setShowReport] =
    useState(false);

  const [error, setError] = useState("");

  const isHindi = language === "hi";

  /*
   * =========================================================
   * TRANSLATIONS
   * =========================================================
   */

  const t = {
    backToDashboard: isHindi
      ? "← डैशबोर्ड पर वापस जाएँ"
      : "← Back to Dashboard",

    reportGeneration: isHindi
      ? "CLINOVA • रिपोर्ट जनरेशन"
      : "CLINOVA • REPORT GENERATION",

    generatePreReport: isHindi
      ? "प्री-कंसल्टेशन रिपोर्ट तैयार करें"
      : "Generate Pre-Consultation Report",

    reportDescription: isHindi
      ? "अपने सेव किए गए मेडिकल दस्तावेज़ में से एक दस्तावेज़ चुनें। Clinova आपके चुने गए दस्तावेज़ और क्लिनिकल इंटरव्यू की जानकारी का उपयोग करके रिपोर्ट तैयार करेगा।"
      : "Select a medical document from your saved documents. Clinova will use the selected document together with your clinical interview to prepare the report.",

    selectDocument: isHindi
      ? "📄 मेडिकल दस्तावेज़ चुनें"
      : "📄 Select a Medical Document",

    selectDocumentDescription: isHindi
      ? "अपने पहले से अपलोड किए गए दस्तावेज़ों में से चुनें।"
      : "Choose from documents you have already uploaded.",

    document: isHindi
      ? "दस्तावेज़"
      : "Document",

    documents: isHindi
      ? "दस्तावेज़"
      : "Documents",

    loadingDocuments: isHindi
      ? "आपके सेव किए गए दस्तावेज़ लोड हो रहे हैं..."
      : "Loading your saved documents...",

    noDocuments: isHindi
      ? "कोई सेव किया गया दस्तावेज़ नहीं मिला"
      : "No saved documents",

    noDocumentsDescription: isHindi
      ? "कृपया पहले Documents सेक्शन से अपना मेडिकल दस्तावेज़ अपलोड करें।"
      : "Please upload your medical document from the Documents section first.",

    goToDocuments: isHindi
      ? "📤 दस्तावेज़ों पर जाएँ"
      : "📤 Go to Documents",

    file: isHindi
      ? "फ़ाइल"
      : "File",

    purpose: isHindi
      ? "उद्देश्य"
      : "Purpose",

    added: isHindi
      ? "जोड़ा गया"
      : "Added",

    aiAnalyzed: isHindi
      ? "🤖 AI द्वारा विश्लेषित"
      : "🤖 AI ANALYZED",

    selected: isHindi
      ? "✓ चुना गया"
      : "✓ SELECTED",

    generateReport: isHindi
      ? "📋 रिपोर्ट तैयार करें"
      : "📋 Generate Report",

    generatingReport: isHindi
      ? "🤖 रिपोर्ट तैयार की जा रही है..."
      : "🤖 Generating Report...",

    uploadFirst: isHindi
      ? "अपना दस्तावेज़ नहीं दिख रहा? पहले उसे Documents सेक्शन से अपलोड करें।"
      : "Don't see your document? Upload it first from the Documents section.",

    myDocuments: isHindi
      ? "📤 मेरे दस्तावेज़ों पर जाएँ"
      : "📤 Go to My Documents",

    preConsultation: isHindi
      ? "CLINOVA • प्री-कंसल्टेशन"
      : "CLINOVA • PRE-CONSULTATION",

    preConsultationReport: isHindi
      ? "प्री-कंसल्टेशन रिपोर्ट"
      : "Pre-Consultation Report",

    basedOn: isHindi
      ? "आधारित दस्तावेज़:"
      : "Based on:",

    aiDraft: isHindi
      ? "AI ड्राफ्ट • सत्यापित नहीं"
      : "AI DRAFT • UNVERIFIED",

    important: isHindi
      ? "महत्वपूर्ण:"
      : "Important:",

    reportWarning: isHindi
      ? "यह उपलब्ध कराई गई जानकारी के आधार पर तैयार की गई AI-जनरेटेड प्रारंभिक रिपोर्ट है। यह कोई निदान या उपचार संबंधी सलाह नहीं है और इसे योग्य स्वास्थ्य विशेषज्ञ द्वारा समीक्षा किया जाना चाहिए।"
      : "This is an AI-generated draft based on the information provided. It is not a diagnosis or treatment recommendation and should be reviewed by a qualified healthcare professional.",

    chooseAnother: isHindi
      ? "📄 दूसरा दस्तावेज़ चुनें"
      : "📄 Choose Another Document",

    shareWithDoctor: isHindi
      ? "🔐 डॉक्टर के साथ साझा करें"
      : "🔐 Share with Doctor",

    dashboard: isHindi
      ? "🏠 डैशबोर्ड"
      : "🏠 Dashboard",

    footer: isHindi
      ? "आपकी रिपोर्ट एक प्रारंभिक AI-जनरेटेड ड्राफ्ट है। कृपया इसकी समीक्षा किसी योग्य स्वास्थ्य विशेषज्ञ से करवाएँ।"
      : "Your report is a preliminary AI-generated draft. Please have it reviewed by a qualified healthcare professional.",

    noDate: isHindi
      ? "तारीख उपलब्ध नहीं"
      : "Date not available",

    loadError: isHindi
      ? "आपके सेव किए गए दस्तावेज़ लोड नहीं हो सके।"
      : "Unable to load your saved documents.",

    selectDocumentError: isHindi
      ? "कृपया पहले एक मेडिकल दस्तावेज़ चुनें।"
      : "Please select a medical document first.",

    reportError: isHindi
      ? "रिपोर्ट तैयार नहीं हो सकी।"
      : "Unable to generate pre-report.",

    noReport: isHindi
      ? "कोई प्री-रिपोर्ट प्राप्त नहीं हुई।"
      : "No pre-report was returned.",
  };

  /*
   * =========================================================
   * LOAD SAVED DOCUMENTS
   * =========================================================
   */

  useEffect(() => {
    loadSavedDocuments();
  }, []);

  const loadSavedDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setError("");

      const saved = await getDocumentsFromDB();

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

      patientDocuments.sort(
        (a, b) =>
          (b.createdAt || 0) -
          (a.createdAt || 0)
      );

      setDocuments(patientDocuments);
    } catch (err) {
      console.error(
        "Unable to load saved documents:",
        err
      );

      setError(t.loadError);
    } finally {
      setLoadingDocuments(false);
    }
  };

  /*
   * =========================================================
   * LOCAL STORAGE HELPERS
   * =========================================================
   */

  const getLocalStorageData = (
    key,
    fallback
  ) => {
    try {
      const value =
        localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (err) {
      console.error(
        `Failed to read ${key}:`,
        err
      );

      return fallback;
    }
  };

  /*
   * =========================================================
   * SELECT DOCUMENT
   * =========================================================
   */

  const handleSelectDocument = (
    document
  ) => {
    setSelectedDocument(document);
    setError("");
  };

  /*
   * =========================================================
   * GENERATE REPORT
   * =========================================================
   */

  const generateReport = async () => {
    if (!selectedDocument) {
      setError(t.selectDocumentError);
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setReport("");
      setShowReport(false);

      const history =
        getLocalStorageData(
          "clinovaInterviewHistory",
          {}
        );

      const documentForReport = {
        id: selectedDocument.id,

        documentName:
          selectedDocument.documentName ||
          selectedDocument.fileName,

        fileName:
          selectedDocument.fileName,

        fileType:
          selectedDocument.fileType,

        purpose:
          selectedDocument.purpose || "",

        createdAt:
          selectedDocument.createdAt || null,

        analyzed:
          Boolean(
            selectedDocument.analyzed
          ),

        extracted:
          selectedDocument.extracted || null,
      };

      console.log(
        "Generating report with selected document:",
        documentForReport
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
            history,

            documents: [
              documentForReport,
            ],

            /*
             * IMPORTANT:
             * Tell backend/Gemini which language
             * the patient selected.
             */
            language: language,

            languageName: isHindi
              ? "Hindi"
              : "English",
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      console.log(
        "Pre-report API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error || t.reportError
        );
      }

      if (!data?.report) {
        throw new Error(t.noReport);
      }

      setReport(data.report);
      setShowReport(true);

      localStorage.setItem(
        "clinovaPreReport",
        data.report
      );

      localStorage.setItem(
        "clinovaSelectedReportDocument",
        JSON.stringify(
          documentForReport
        )
      );
    } catch (err) {
      console.error(
        "Pre-report error:",
        err
      );

      setError(
        err?.message || t.reportError
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const goToDashboard = () => {
    navigate("/patient/dashboard");
  };

  const goToDocuments = () => {
    localStorage.setItem(
      "clinovaDocumentFlow",
      "dashboard"
    );

    navigate("/documents");
  };

  const shareWithDoctor = () => {
    localStorage.setItem(
      "clinovaShareSource",
      "pre-report"
    );

    navigate("/share-access");
  };

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return t.noDate;
    }

    return new Date(
      timestamp
    ).toLocaleDateString(
      isHindi ? "hi-IN" : "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
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
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "32px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={goToDashboard}
            style={{
              border: "none",
              background: "transparent",
              color: "#0E6E64",
              fontWeight: "700",
              cursor: "pointer",
              padding: 0,
              marginBottom: "20px",
            }}
          >
            {t.backToDashboard}
          </button>

          <p
            style={{
              color: "#0E6E64",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            {t.reportGeneration}
          </p>

          <h1
            style={{
              margin: 0,
              color: "#1F2937",
              fontSize: "30px",
            }}
          >
            {t.generatePreReport}
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            {t.reportDescription}
          </p>
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
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* DOCUMENT SELECTION */}

        {!showReport && (
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
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#1F2937",
                  }}
                >
                  {t.selectDocument}
                </h2>

                <p
                  style={{
                    color: "#6B7280",
                    marginBottom: 0,
                  }}
                >
                  {t.selectDocumentDescription}
                </p>
              </div>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#EAF5F3",
                  color: "#0E6E64",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {documents.length}{" "}
                {documents.length === 1
                  ? t.document
                  : t.documents}
              </span>
            </div>

            {loadingDocuments ? (
              <div
                style={{
                  marginTop: "25px",
                  color: "#6B7280",
                }}
              >
                {t.loadingDocuments}
              </div>
            ) : documents.length === 0 ? (
              <div
                style={{
                  marginTop: "25px",
                  padding: "30px",
                  borderRadius: "14px",
                  background: "#F9FAFB",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "10px",
                  }}
                >
                  📂
                </div>

                <h3
                  style={{
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  {t.noDocuments}
                </h3>

                <p
                  style={{
                    color: "#6B7280",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {t.noDocumentsDescription}
                </p>

                <button
                  onClick={goToDocuments}
                  style={{
                    marginTop: "10px",
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#0E6E64",
                    color: "#FFFFFF",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {t.goToDocuments}
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginTop: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {documents.map(
                  (document) => {
                    const isSelected =
                      selectedDocument?.id ===
                      document.id;

                    return (
                      <button
                        key={document.id}
                        onClick={() =>
                          handleSelectDocument(
                            document
                          )
                        }
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "18px",
                          borderRadius: "14px",

                          border: isSelected
                            ? "2px solid #0E6E64"
                            : "1px solid #E5E7EB",

                          background:
                            isSelected
                              ? "#EAF5F3"
                              : "#F9FAFB",

                          cursor: "pointer",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "15px",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin:
                                  "0 0 6px",
                                color:
                                  "#1F2937",
                              }}
                            >
                              📄{" "}
                              {document.documentName ||
                                document.fileName}
                            </h3>

                            <p
                              style={{
                                margin:
                                  "0 0 5px",
                                color:
                                  "#6B7280",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {t.file}:{" "}
                              {
                                document.fileName
                              }
                            </p>

                            {document.purpose && (
                              <p
                                style={{
                                  margin:
                                    "0 0 5px",
                                  color:
                                    "#6B7280",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                {t.purpose}:{" "}
                                {
                                  document.purpose
                                }
                              </p>
                            )}

                            <p
                              style={{
                                margin: 0,
                                color:
                                  "#9CA3AF",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {t.added}:{" "}
                              {formatDate(
                                document.createdAt
                              )}{" "}
                              •{" "}
                              {formatFileSize(
                                document.fileSize
                              )}
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection:
                                "column",
                              alignItems:
                                "flex-end",
                              gap: "6px",
                            }}
                          >
                            {document.analyzed && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#ECFDF5",
                                  color:
                                    "#047857",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    "700",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {t.aiAnalyzed}
                              </span>
                            )}

                            {isSelected && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#0E6E64",
                                  color:
                                    "#FFFFFF",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    "700",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {t.selected}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* GENERATE BUTTON */}

            {documents.length > 0 && (
              <button
                onClick={generateReport}
                disabled={
                  !selectedDocument ||
                  generating
                }
                style={{
                  width: "100%",
                  marginTop: "22px",
                  padding: "15px",
                  border: "none",
                  borderRadius: "12px",

                  background:
                    !selectedDocument ||
                    generating
                      ? "#9CA3AF"
                      : "#0E6E64",

                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: "700",

                  cursor:
                    !selectedDocument ||
                    generating
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {generating
                  ? t.generatingReport
                  : t.generateReport}
              </button>
            )}

            <p
              style={{
                marginTop: "16px",
                textAlign: "center",
                color: "#9CA3AF",
                fontSize: "12px",
              }}
            >
              {t.uploadFirst}
            </p>

            <button
              onClick={goToDocuments}
              style={{
                display: "block",
                margin: "0 auto",
                border: "none",
                background:
                  "transparent",
                color: "#0E6E64",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {t.myDocuments}
            </button>
          </div>
        )}

        {/* =================================================
            GENERATED REPORT
            ================================================= */}

        {showReport && (
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
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#0E6E64",
                    fontWeight: "700",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  {t.preConsultation}
                </p>

                <h1
                  style={{
                    margin: 0,
                    color: "#1F2937",
                    fontSize: "30px",
                  }}
                >
                  {t.preConsultationReport}
                </h1>

                {selectedDocument && (
                  <p
                    style={{
                      color: "#6B7280",
                      marginTop: "10px",
                    }}
                  >
                    {t.basedOn}{" "}
                    <strong>
                      {selectedDocument.documentName ||
                        selectedDocument.fileName}
                    </strong>
                  </p>
                )}
              </div>

              <span
                style={{
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "#FFF7ED",
                  color: "#C2410C",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {t.aiDraft}
              </span>
            </div>

            <div
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "14px",
                background: "#F9FAFB",
                border:
                  "1px solid #E5E7EB",
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                color: "#374151",
              }}
            >
              {report}
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px",
                borderRadius: "12px",
                background: "#FFF7ED",
                border:
                  "1px solid #FED7AA",
                color: "#9A3412",
                lineHeight: 1.5,
                fontSize: "13px",
              }}
            >
              <strong>
                {t.important}
              </strong>{" "}
              {t.reportWarning}
            </div>

            {/* ACTION BUTTONS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginTop: "22px",
              }}
            >
              <button
                onClick={() => {
                  setShowReport(false);
                  setReport("");
                }}
                style={{
                  padding: "14px",
                  border:
                    "1px solid #0E6E64",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  color: "#0E6E64",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {t.chooseAnother}
              </button>

              <button
                onClick={shareWithDoctor}
                style={{
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#0E6E64",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {t.shareWithDoctor}
              </button>

              <button
                onClick={goToDashboard}
                style={{
                  padding: "14px",
                  border:
                    "1px solid #D1D5DB",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {t.dashboard}
              </button>
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#6B7280",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {t.footer}
        </p>
      </div>
    </div>
  );
}
