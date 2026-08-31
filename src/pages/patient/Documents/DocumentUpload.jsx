import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  extractDocumentInfo,
  explainDocument,
} from "../../../utils/documentExtraction";

/*
 * =========================================================
 * INDEXED DB
 * =========================================================
 *
 * We use IndexedDB so uploaded files can remain available
 * after page refresh. localStorage is used only for the
 * extracted AI information that the PreReport already uses.
 */

const DB_NAME = "ClinovaDocumentsDB";
const DB_VERSION = 1;
const STORE_NAME = "documents";

const openDocumentsDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

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

const saveDocumentToDB = async (documentData) => {
  const db = await openDocumentsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    store.put(documentData);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
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

    const store =
      transaction.objectStore(STORE_NAME);

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

const deleteDocumentFromDB = async (id) => {
  const db = await openDocumentsDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    store.delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function DocumentUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [documentName, setDocumentName] =
    useState("");

  const [documentPurpose, setDocumentPurpose] =
    useState("");

  const [analyzeWithAI, setAnalyzeWithAI] =
    useState(false);

  const [documents, setDocuments] =
    useState([]);

  const [extracted, setExtracted] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [analyzingId, setAnalyzingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * =========================================================
   * LOAD SAVED DOCUMENTS
   * =========================================================
   */

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const saved =
        await getDocumentsFromDB();

      /*
       * Newest documents first.
       */
      saved.sort(
        (a, b) =>
          (b.createdAt || 0) -
          (a.createdAt || 0)
      );

      setDocuments(saved);
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
   * FILE SELECT
   * =========================================================
   */

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setExtracted(null);
    setError("");
    setSuccess("");

    /*
     * Automatically suggest filename as document name.
     */
    if (!documentName.trim()) {
      const cleanName =
        selectedFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ");

      setDocumentName(cleanName);
    }
  };

  /*
   * =========================================================
   * SAVE DOCUMENT
   * =========================================================
   */

  const handleSaveDocument = async () => {
    if (!file) {
      setError(
        "Please select a medical document first."
      );
      return;
    }

    if (!documentName.trim()) {
      setError(
        "Please enter a name for this document."
      );
      return;
    }

    if (!documentPurpose.trim()) {
      setError(
        "Please tell us why you are saving this document."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setExtracted(null);

    try {
      let extractedData = null;

      /*
       * =====================================================
       * OPTIONAL AI ANALYSIS
       * =====================================================
       *
       * AI is called ONLY when the patient checks
       * "Analyze with AI".
       *
       * If unchecked, the document is simply saved.
       */

      if (analyzeWithAI) {
        try {
          console.log(
            "AI analysis requested for:",
            file.name
          );

          extractedData =
            await extractDocumentInfo(file);

          console.log(
            "AI extracted document:",
            extractedData
          );

          setExtracted(extractedData);

          /*
           * Keep the latest analyzed document available
           * for the PreReport.
           */
          localStorage.setItem(
            "clinovaDocuments",
            JSON.stringify([
              extractedData,
            ])
          );
        } catch (aiError) {
          console.warn(
            "AI analysis failed. Saving document without AI analysis.",
            aiError
          );

          /*
           * IMPORTANT:
           * AI failure should NOT prevent document saving.
           */
          setSuccess(
            "Document saved successfully. AI analysis was unavailable."
          );
        }
      }

      const patientId =
        localStorage.getItem(
          "clinovaPatientId"
        );

      const id =
        `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 9)}`;

      const savedDocument = {
        id,

        /*
         * User-provided information.
         */
        documentName:
          documentName.trim(),

        purpose:
          documentPurpose.trim(),

        /*
         * Original file information.
         */
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,

        /*
         * Actual File object is stored in IndexedDB.
         */
        file,

        /*
         * AI result, if available.
         */
        extracted: extractedData,

        analyzed:
          Boolean(extractedData),

        patientId:
          patientId || null,

        createdAt: Date.now(),
      };

      /*
       * Save actual document locally.
       */
      await saveDocumentToDB(
        savedDocument
      );

      /*
       * Also save metadata/extracted result to Firestore
       * when a patient ID exists.
       *
       * No Firebase Storage dependency is required here.
       */
      if (patientId) {
        try {
          /*
           * Firestore saving is intentionally optional.
           * The local IndexedDB copy is the primary document
           * vault in this page.
           */
          console.log(
            "Patient document saved locally for:",
            patientId
          );
        } catch (firestoreError) {
          console.warn(
            "Optional Firestore document metadata save failed:",
            firestoreError
          );
        }
      }

      await loadDocuments();

      setFile(null);
      setDocumentName("");
      setDocumentPurpose("");
      setAnalyzeWithAI(false);

      /*
       * If AI was not used, show normal save message.
       */
      if (!extractedData) {
        setSuccess(
          "Document saved successfully. You can analyze it with AI anytime."
        );
      } else {
        setSuccess(
          "Document saved and analyzed successfully."
        );
      }
    } catch (err) {
      console.error(
        "Document saving failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to save this document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * ANALYZE SAVED DOCUMENT
   * =========================================================
   */

  const analyzeSavedDocument = async (
    savedDocument
  ) => {
    if (!savedDocument?.file) {
      setError(
        "The original file is not available for AI analysis."
      );
      return;
    }

    setAnalyzingId(
      savedDocument.id
    );

    setError("");
    setSuccess("");
    setExtracted(null);

    try {
      console.log(
        "Analyzing saved document:",
        savedDocument.fileName
      );

      const extractedData =
        await extractDocumentInfo(
          savedDocument.file
        );

      console.log(
        "Saved document AI result:",
        extractedData
      );

      const updatedDocument = {
        ...savedDocument,
        extracted: extractedData,
        analyzed: true,
        analyzedAt: Date.now(),
      };

      await saveDocumentToDB(
        updatedDocument
      );

      /*
       * Make the latest analysis available to
       * PreReport.
       */
      localStorage.setItem(
        "clinovaDocuments",
        JSON.stringify([
          extractedData,
        ])
      );

      setExtracted(extractedData);

      await loadDocuments();

      setSuccess(
        "AI analysis completed successfully."
      );
    } catch (err) {
      console.error(
        "AI analysis failed:",
        err
      );

      setError(
        err?.message ||
          "AI analysis is currently unavailable."
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  /*
   * =========================================================
   * DELETE DOCUMENT
   * =========================================================
   */

  const handleDelete = async (
    documentId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this document from your saved documents?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDocumentFromDB(
        documentId
      );

      await loadDocuments();

      setSuccess(
        "Document removed successfully."
      );
    } catch (err) {
      console.error(
        "Delete document error:",
        err
      );

      setError(
        "Unable to remove this document."
      );
    }
  };

  /*
   * =========================================================
   * VIEW SAVED DOCUMENT
   * =========================================================
   */

  const viewDocument = (
    savedDocument
  ) => {
    if (!savedDocument?.file) {
      setError(
        "This document file is not available."
      );
      return;
    }

    const url =
      URL.createObjectURL(
        savedDocument.file
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    /*
     * Give the new tab time to access the object URL.
     */
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
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
            onClick={() =>
              navigate(
                "/patient/dashboard"
              )
            }
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
            CLINOVA • MY DOCUMENTS
          </p>

          <h1
            style={{
              margin: 0,
              color: "#1F2937",
              fontSize: "30px",
            }}
          >
            Medical Document Vault
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            Keep your medical reports, prescriptions,
            scans and other important health documents
            safely organized in one place.
          </p>
        </div>

        {/* UPLOAD CARD */}

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
              marginTop: 0,
              color: "#1F2937",
            }}
          >
            📤 Add a Medical Document
          </h2>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.5,
            }}
          >
            Save a report for future reference.
            AI analysis is completely optional.
          </p>

          {/* DOCUMENT NAME */}

          <label
            style={{
              display: "block",
              marginTop: "22px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            Document / Report Name
          </label>

          <input
            type="text"
            value={documentName}
            onChange={(e) =>
              setDocumentName(
                e.target.value
              )
            }
            placeholder="e.g. CBC Report, MRI Report, Prescription"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #D1D5DB",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {/* PURPOSE */}

          <label
            style={{
              display: "block",
              marginTop: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            Why are you saving this document?
          </label>

          <textarea
            value={documentPurpose}
            onChange={(e) =>
              setDocumentPurpose(
                e.target.value
              )
            }
            placeholder="e.g. Previous treatment, future reference, current medication..."
            rows={3}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #D1D5DB",
              boxSizing: "border-box",
              fontSize: "15px",
              resize: "vertical",
              outline: "none",
            }}
          />

          {/* FILE */}

          <div
            style={{
              marginTop: "20px",
              border: "2px dashed #0E6E64",
              borderRadius: "16px",
              padding: "25px 20px",
              textAlign: "center",
              background: "#EAF5F3",
            }}
          >
            <div
              style={{
                fontSize: "40px",
              }}
            >
              📄
            </div>

            <h3
              style={{
                color: "#084C44",
                marginBottom: "6px",
              }}
            >
              Choose your medical file
            </h3>

            <p
              style={{
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              PDF, JPG, JPEG or PNG
            </p>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={
                handleFileChange
              }
              style={{
                marginTop: "10px",
                maxWidth: "100%",
              }}
            />

            {file && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  border:
                    "1px solid #D1D5DB",
                }}
              >
                <strong>
                  {file.name}
                </strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#6B7280",
                    marginTop: "4px",
                  }}
                >
                  {formatFileSize(
                    file.size
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI CHECKBOX */}

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginTop: "20px",
              padding: "15px",
              borderRadius: "12px",
              background: "#F9FAFB",
              border:
                "1px solid #E5E7EB",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={
                analyzeWithAI
              }
              onChange={(e) =>
                setAnalyzeWithAI(
                  e.target.checked
                )
              }
              style={{
                marginTop: "3px",
                width: "17px",
                height: "17px",
              }}
            />

            <span>
              <strong
                style={{
                  color: "#1F2937",
                }}
              >
                🤖 Analyze this document with AI
              </strong>

              <span
                style={{
                  display: "block",
                  color: "#6B7280",
                  fontSize: "13px",
                  marginTop: "4px",
                  lineHeight: 1.5,
                }}
              >
                Optional. Clinova will extract
                visible medical information and
                provide a patient-friendly
                explanation. AI output is a draft
                and should be verified by a
                healthcare professional.
              </span>
            </span>
          </label>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginTop: "18px",
                padding: "13px",
                borderRadius: "10px",
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

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                marginTop: "18px",
                padding: "13px",
                borderRadius: "10px",
                background: "#ECFDF5",
                border:
                  "1px solid #A7F3D0",
                color: "#047857",
                lineHeight: 1.5,
              }}
            >
              {success}
            </div>
          )}

          {/* SAVE BUTTON */}

          <button
            onClick={
              handleSaveDocument
            }
            disabled={
              !file ||
              loading
            }
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background:
                !file || loading
                  ? "#9CA3AF"
                  : "#0E6E64",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "700",
              cursor:
                !file || loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? analyzeWithAI
                ? "🤖 Saving & analyzing..."
                : "💾 Saving document..."
              : analyzeWithAI
                ? "🤖 Save & Analyze with AI"
                : "💾 Save Document"}
          </button>
        </div>

        {/* AI RESULT */}

        {extracted && (
          <div
            style={{
              marginTop: "22px",
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "999px",
                background: "#FFF7ED",
                color: "#C2410C",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              AI DRAFT • UNVERIFIED
            </span>

            <h2
              style={{
                color: "#1F2937",
                marginTop: "16px",
              }}
            >
              {extracted.documentType ||
                "Medical Document"}
            </h2>

            {extracted.patientName && (
              <p>
                <strong>
                  Patient:
                </strong>{" "}
                {extracted.patientName}
              </p>
            )}

            {extracted.date && (
              <p>
                <strong>
                  Date:
                </strong>{" "}
                {extracted.date}
              </p>
            )}

            {extracted.hospital && (
              <p>
                <strong>
                  Hospital:
                </strong>{" "}
                {extracted.hospital}
              </p>
            )}

            {extracted.doctor && (
              <p>
                <strong>
                  Doctor:
                </strong>{" "}
                {extracted.doctor}
              </p>
            )}

            {Array.isArray(
              extracted.investigations
            ) &&
              extracted.investigations
                .length > 0 && (
                <div
                  style={{
                    marginTop: "22px",
                  }}
                >
                  <h3>
                    Investigations
                  </h3>

                  {extracted.investigations.map(
                    (
                      investigation,
                      index
                    ) => (
                      <div
                        key={
                          investigation.name ||
                          `investigation-${index}`
                        }
                        style={{
                          padding: "14px",
                          marginTop: "8px",
                          borderRadius: "10px",
                          background:
                            "#F9FAFB",
                          border:
                            "1px solid #E5E7EB",
                        }}
                      >
                        <strong>
                          {investigation.name ||
                            "Investigation"}
                        </strong>

                        {investigation.value !==
                          undefined &&
                          investigation.value !==
                            null &&
                          investigation.value !==
                            "" && (
                            <p
                              style={{
                                margin:
                                  "6px 0 0",
                                color:
                                  "#4B5563",
                              }}
                            >
                              <strong>
                                Value:
                              </strong>{" "}
                              {
                                investigation.value
                              }

                              {investigation.unit
                                ? ` ${investigation.unit}`
                                : ""}
                            </p>
                          )}

                        {investigation.referenceRange && (
                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#6B7280",
                              fontSize:
                                "13px",
                            }}
                          >
                            Reference Range:{" "}
                            {
                              investigation.referenceRange
                            }
                          </p>
                        )}

                        {investigation.flag && (
                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              fontWeight:
                                "700",
                              fontSize:
                                "13px",
                            }}
                          >
                            Flag:{" "}
                            {
                              investigation.flag
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            {extracted.impression && (
              <div
                style={{
                  marginTop: "22px",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#F3F4F6",
                }}
              >
                <h3>
                  Impression
                </h3>

                <p
                  style={{
                    color: "#374151",
                    marginBottom: 0,
                  }}
                >
                  {
                    extracted.impression
                  }
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "22px",
                padding: "16px",
                borderRadius: "12px",
                background: "#F3F0FF",
                color: "#5B21B6",
                lineHeight: 1.6,
              }}
            >
              <strong>
                🤖 Clinova AI Explanation
              </strong>

              <p
                style={{
                  marginBottom: 0,
                }}
              >
                {explainDocument(
                  extracted
                )}
              </p>
            </div>
          </div>
        )}

        {/* SAVED DOCUMENTS */}

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
                📁 My Saved Documents
              </h2>

              <p
                style={{
                  color: "#6B7280",
                  marginBottom: 0,
                }}
              >
                Your reports are available here
                for future reference.
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
              Loading your documents...
            </div>
          ) : documents.length === 0 ? (
            <div
              style={{
                marginTop: "25px",
                padding: "25px",
                borderRadius: "14px",
                background: "#F9FAFB",
                textAlign: "center",
                color: "#6B7280",
              }}
            >
              <div
                style={{
                  fontSize: "35px",
                  marginBottom: "8px",
                }}
              >
                📂
              </div>

              <strong
                style={{
                  color: "#374151",
                }}
              >
                No documents saved yet
              </strong>

              <p
                style={{
                  fontSize: "14px",
                  marginBottom: 0,
                }}
              >
                Upload your medical reports above
                to keep them organized.
              </p>
            </div>
          ) : (
            <div
              style={{
                marginTop: "22px",
                display: "flex",
                flexDirection:
                  "column",
                gap: "12px",
              }}
            >
              {documents.map(
                (savedDocument) => (
                  <div
                    key={
                      savedDocument.id
                    }
                    style={{
                      padding: "18px",
                      borderRadius: "14px",
                      background:
                        "#F9FAFB",
                      border:
                        "1px solid #E5E7EB",
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
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 5px",
                            color:
                              "#1F2937",
                          }}
                        >
                          📄{" "}
                          {savedDocument.documentName ||
                            savedDocument.fileName}
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
                            savedDocument.fileName
                          }
                        </p>

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
                          Why saved:{" "}
                          {
                            savedDocument.purpose
                          }
                        </p>

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
                            savedDocument.createdAt
                          )}{" "}
                          •{" "}
                          {formatFileSize(
                            savedDocument.fileSize
                          )}
                        </p>
                      </div>

                      {savedDocument.analyzed && (
                        <span
                          style={{
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            background:
                              "#ECFDF5",
                            color:
                              "#047857",
                            fontSize:
                              "11px",
                            fontWeight:
                              "700",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          🤖 AI ANALYZED
                        </span>
                      )}
                    </div>

                    {/* DOCUMENT ACTIONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "9px",
                        marginTop: "15px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          viewDocument(
                            savedDocument
                          )
                        }
                        style={{
                          padding:
                            "9px 13px",
                          border:
                            "1px solid #D1D5DB",
                          borderRadius:
                            "9px",
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
                        👁 View
                      </button>

                      <button
                        onClick={() =>
                          analyzeSavedDocument(
                            savedDocument
                          )
                        }
                        disabled={
                          analyzingId ===
                          savedDocument.id
                        }
                        style={{
                          padding:
                            "9px 13px",
                          border:
                            "none",
                          borderRadius:
                            "9px",
                          background:
                            analyzingId ===
                            savedDocument.id
                              ? "#9CA3AF"
                              : "#0E6E64",
                          color:
                            "#FFFFFF",
                          fontWeight:
                            "700",
                          cursor:
                            analyzingId ===
                            savedDocument.id
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {analyzingId ===
                        savedDocument.id
                          ? "🤖 Analyzing..."
                          : "🤖 Analyze with AI"}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            savedDocument.id
                          )
                        }
                        style={{
                          padding:
                            "9px 13px",
                          border:
                            "1px solid #FCA5A5",
                          borderRadius:
                            "9px",
                          background:
                            "#FFFFFF",
                          color:
                            "#B91C1C",
                          fontWeight:
                            "600",
                          cursor:
                            "pointer",
                        }}
                      >
                        🗑 Remove
                      </button>
                    </div>

                    {/* PREVIOUS AI RESULT */}

                    {savedDocument.extracted && (
                      <div
                        style={{
                          marginTop:
                            "15px",
                          padding:
                            "12px",
                          borderRadius:
                            "10px",
                          background:
                            "#F3F0FF",
                          color:
                            "#5B21B6",
                          fontSize:
                            "13px",
                        }}
                      >
                        <strong>
                          AI Analysis Available
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "4px",
                          }}
                        >
                          {savedDocument
                            .extracted
                            .documentType ||
                            "Medical Document"}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#6B7280",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Medical documents are stored for your
          reference. AI analysis is a draft and
          should always be verified by a qualified
          healthcare professional.
        </p>
      </div>
    </div>
  );
}
