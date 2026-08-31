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
 * COMPONENT
 * =========================================================
 */

export default function PreReport() {
  const navigate = useNavigate();

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

      const saved =
        await getDocumentsFromDB();

      const patientId =
        localStorage.getItem(
          "clinovaPatientId"
        );

      /*
       * Show only documents belonging to
       * the current patient.
       *
       * Older documents without patientId
       * are also kept visible for compatibility.
       */

      const patientDocuments =
        patientId
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

      setError(
        "Unable to load your saved documents."
      );
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
      setError(
        "Please select a medical document first."
      );

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

      /*
       * IMPORTANT:
       *
       * The report receives ONLY the selected
       * document instead of all documents.
       *
       * This fixes the old behaviour where
       * clinovaDocuments contained only the
       * latest AI extraction.
       */

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

            /*
             * Keep the API structure simple:
             * documents is an array containing
             * ONLY the selected document.
             */

            documents: [
              documentForReport,
            ],
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
          data?.error ||
            "Unable to generate pre-report."
        );
      }

      if (!data?.report) {
        throw new Error(
          "No pre-report was returned."
        );
      }

      setReport(data.report);
      setShowReport(true);

      /*
       * Keep existing localStorage key
       * for ShareAccess and other pages.
       */

      localStorage.setItem(
        "clinovaPreReport",
        data.report
      );

      /*
       * Also remember which document was used
       * for this report.
       */

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
        err?.message ||
          "Unable to generate pre-report."
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
    navigate(
      "/patient/dashboard"
    );
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

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return "0 KB";
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  const formatDate = (
    timestamp
  ) => {
    if (!timestamp) {
      return "";
    }

    return new Date(
      timestamp
    ).toLocaleDateString(
      "en-IN",
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
            ← Back to Dashboard
          </button>

          <p
            style={{
              color: "#0E6E64",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            CLINOVA • REPORT GENERATION
          </p>

          <h1
            style={{
              margin: 0,
              color: "#1F2937",
              fontSize: "30px",
            }}
          >
            Generate Pre-Consultation Report
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            Select a medical document from your
            saved documents. Clinova will use the
            selected document together with your
            clinical interview to prepare the
            report.
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
                  📄 Select a Medical Document
                </h2>

                <p
                  style={{
                    color: "#6B7280",
                    marginBottom: 0,
                  }}
                >
                  Choose from documents you have
                  already uploaded.
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
                  ? "Document"
                  : "Documents"}
              </span>
            </div>

            {loadingDocuments ? (
              <div
                style={{
                  marginTop: "25px",
                  color: "#6B7280",
                }}
              >
                Loading your saved documents...
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
                  No saved documents
                </h3>

                <p
                  style={{
                    color: "#6B7280",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Please upload your medical
                  document from the Documents section
                  first.
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
                  📤 Go to Documents
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
                              File:{" "}
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
                                Purpose:{" "}
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
                              Added:{" "}
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
                                🤖 AI ANALYZED
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
                                ✓ SELECTED
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
                  ? "🤖 Generating Report..."
                  : "📋 Generate Report"}
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
              Don't see your document? Upload it
              first from the Documents section.
            </p>

            <button
              onClick={goToDocuments}
              style={{
                display: "block",
                margin:
                  "0 auto",
                border: "none",
                background:
                  "transparent",
                color: "#0E6E64",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📤 Go to My Documents
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
                  CLINOVA • PRE-CONSULTATION
                </p>

                <h1
                  style={{
                    margin: 0,
                    color: "#1F2937",
                    fontSize: "30px",
                  }}
                >
                  Pre-Consultation Report
                </h1>

                {selectedDocument && (
                  <p
                    style={{
                      color: "#6B7280",
                      marginTop: "10px",
                    }}
                  >
                    Based on:{" "}
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
                AI DRAFT • UNVERIFIED
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
                Important:
              </strong>{" "}
              This is an AI-generated draft based
              on the information provided. It is not
              a diagnosis or treatment
              recommendation and should be reviewed
              by a qualified healthcare professional.
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
                📄 Choose Another Document
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
                🔐 Share with Doctor
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
                🏠 Dashboard
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
          Your report is a preliminary AI-generated
          draft. Please have it reviewed by a qualified
          healthcare professional.
        </p>
      </div>
    </div>
  );
}