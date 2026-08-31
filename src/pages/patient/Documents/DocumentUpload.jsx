// src/pages/patient/documents/DocumentUpload.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  extractDocumentInfo,
  explainDocument,
} from "../../../utils/documentExtraction";

export default function DocumentUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setExtracted(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please select a medical document first."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(
        "Sending actual document to AI:",
        file.name
      );

      // Send actual File object
      const extractedData =
        await extractDocumentInfo(file);

      console.log(
        "AI extracted document:",
        extractedData
      );

      setExtracted(extractedData);

      /*
       * Save extracted document information locally
       * so PreReport can use it.
       */
      localStorage.setItem(
        "clinovaDocuments",
        JSON.stringify([extractedData])
      );

      /*
       * Save to Firestore when patient ID exists.
       */
      const patientId =
        localStorage.getItem(
          "clinovaPatientId"
        );

      if (patientId) {
        const safeName = file.name
          .replace(/[^a-zA-Z0-9]/g, "_")
          .slice(0, 40);

        const documentId = `${Date.now()}_${safeName}`;

        await setDoc(
          doc(
            db,
            "patients",
            patientId,
            "documents",
            documentId
          ),
          {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,

            ...extractedData,

            uploadedAt: Date.now(),
          }
        );

        console.log(
          "Document saved to Firestore."
        );
      }
    } catch (err) {
      console.error(
        "Document processing failed:",
        err
      );

      setError(
        err.message ||
          "Unable to process this document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const continueToPreReport = () => {
    navigate("/pre-report");
  };

  const skipDocuments = () => {
    /*
     * Make sure pre-report knows that
     * documents are optional.
     */
    localStorage.setItem(
      "clinovaDocuments",
      JSON.stringify([])
    );

    navigate("/pre-report");
  };

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
          borderRadius: "20px",
          padding: "32px",
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
            marginBottom: "8px",
          }}
        >
          STEP 2 • MEDICAL RECORDS
        </p>

        <h1
          style={{
            margin: 0,
            color: "#1F2937",
            fontSize: "30px",
          }}
        >
          Upload Medical Documents
        </h1>

        <p
          style={{
            color: "#6B7280",
            lineHeight: 1.6,
            marginTop: "12px",
          }}
        >
          Your clinical interview is complete. You can
          attach previous medical reports, prescriptions,
          lab reports, scans, ECGs, discharge summaries,
          or other relevant medical documents.
        </p>

        <p
          style={{
            color: "#0E6E64",
            fontWeight: "600",
            marginTop: "8px",
          }}
        >
          Documents are optional. You can continue
          without uploading anything.
        </p>

        {/* UPLOAD AREA */}

        <div
          style={{
            marginTop: "28px",
            border: "2px dashed #0E6E64",
            borderRadius: "16px",
            padding: "30px 20px",
            textAlign: "center",
            background: "#EAF5F3",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
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
            Add a medical document
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
            onChange={handleFileChange}
            style={{
              marginTop: "12px",
              maxWidth: "100%",
            }}
          />

          {file && (
            <div
              style={{
                marginTop: "16px",
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
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: "#FEF2F2",
              border:
                "1px solid #FCA5A5",
              color: "#B91C1C",
            }}
          >
            {error}
          </div>
        )}

        {/* UPLOAD */}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
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
            ? "🤖 AI is analyzing document..."
            : "Upload & Analyze with AI"}
        </button>

        {/* EXTRACTED RESULT */}

        {extracted && (
          <div
            style={{
              marginTop: "28px",
              padding: "24px",
              borderRadius: "16px",
              background: "#F9FAFB",
              border:
                "1px solid #E5E7EB",
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
                marginTop: "16px",
                color: "#1F2937",
              }}
            >
              {extracted.documentType ||
                "Medical Document"}
            </h2>

            {extracted.patientName && (
              <p>
                <strong>Patient:</strong>{" "}
                {extracted.patientName}
              </p>
            )}

            {extracted.date && (
              <p>
                <strong>Date:</strong>{" "}
                {extracted.date}
              </p>
            )}

            {extracted.hospital && (
              <p>
                <strong>Hospital:</strong>{" "}
                {extracted.hospital}
              </p>
            )}

            {extracted.doctor && (
              <p>
                <strong>Doctor:</strong>{" "}
                {extracted.doctor}
              </p>
            )}

            {extracted.clinicalIndication && (
              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <h3>
                  Clinical Indication
                </h3>

                <p
                  style={{
                    color: "#4B5563",
                  }}
                >
                  {extracted.clinicalIndication}
                </p>
              </div>
            )}

            {/* INVESTIGATIONS */}

            {Array.isArray(
              extracted.investigations
            ) &&
              extracted.investigations.length >
                0 && (
                <div
                  style={{
                    marginTop: "24px",
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
                            "#FFFFFF",
                          border:
                            "1px solid #E5E7EB",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                          }}
                        >
                          <strong>
                            {investigation.name ||
                              "Investigation"}
                          </strong>

                          {investigation.flag && (
                            <span
                              style={{
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {
                                investigation.flag
                              }
                            </span>
                          )}
                        </div>

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
                      </div>
                    )
                  )}
                </div>
              )}

            {/* FINDINGS */}

            {Array.isArray(
              extracted.findings
            ) &&
              extracted.findings.length >
                0 && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3>Findings</h3>

                  <ul
                    style={{
                      paddingLeft: "20px",
                    }}
                  >
                    {extracted.findings.map(
                      (finding, index) => (
                        <li key={index}>
                          {String(finding)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* IMPRESSION */}

            {extracted.impression && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "14px",
                  borderRadius: "12px",
                  background:
                    "#F3F4F6",
                }}
              >
                <h3>Impression</h3>

                <p
                  style={{
                    marginBottom: 0,
                    color: "#374151",
                  }}
                >
                  {extracted.impression}
                </p>
              </div>
            )}

            {/* MEDICATIONS */}

            {Array.isArray(
              extracted.medications
            ) &&
              extracted.medications.length >
                0 && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3>Medications</h3>

                  {extracted.medications.map(
                    (medicine, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "12px",
                          marginTop: "8px",
                          borderRadius:
                            "10px",
                          background:
                            "#FFFFFF",
                          border:
                            "1px solid #E5E7EB",
                        }}
                      >
                        <strong>
                          {medicine.name ||
                            "Medicine"}
                        </strong>

                        {medicine.dose && (
                          <div>
                            Dose:{" "}
                            {medicine.dose}
                          </div>
                        )}

                        {medicine.frequency && (
                          <div>
                            Frequency:{" "}
                            {
                              medicine.frequency
                            }
                          </div>
                        )}

                        {medicine.duration && (
                          <div>
                            Duration:{" "}
                            {
                              medicine.duration
                            }
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* DIAGNOSIS */}

            {Array.isArray(
              extracted.diagnosis
            ) &&
              extracted.diagnosis.length >
                0 && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3>
                    Diagnosis / Impression
                  </h3>

                  <ul
                    style={{
                      paddingLeft: "20px",
                    }}
                  >
                    {extracted.diagnosis.map(
                      (item, index) => (
                        <li key={index}>
                          {String(item)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* RECOMMENDATIONS */}

            {Array.isArray(
              extracted.recommendations
            ) &&
              extracted.recommendations.length >
                0 && (
                <div
                  style={{
                    marginTop: "24px",
                  }}
                >
                  <h3>
                    Recommendations
                  </h3>

                  <ul
                    style={{
                      paddingLeft: "20px",
                    }}
                  >
                    {extracted.recommendations.map(
                      (item, index) => (
                        <li key={index}>
                          {String(item)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* AI EXPLANATION */}

            <div
              style={{
                marginTop: "24px",
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

        {/* CONTINUE */}

        {extracted && (
          <button
            onClick={continueToPreReport}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: "#0E6E64",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Continue to Generate Pre-Report →
          </button>
        )}

        {/* SKIP */}

        {!extracted && (
          <button
            onClick={skipDocuments}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "14px",
              border:
                "1px solid #0E6E64",
              borderRadius: "12px",
              background: "#FFFFFF",
              color: "#0E6E64",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            I don't have documents → Continue
          </button>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#6B7280",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          AI extraction is a draft. Medical information
          should be verified by a qualified healthcare
          professional.
        </p>
      </div>

    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Clinical Interview</h1>
      <p>History Completeness: {completeness}%</p>
      {priorityAlert && <p style={{ color: "red", fontWeight: "bold" }}>⚠️ {priorityAlert}</p>}
      <p>{currentQuestion}</p>
      <button onClick={() => handleAnswer("breathingDifficulty", true)}>Yes</button>
      <button onClick={() => handleAnswer("breathingDifficulty", false)}>No</button>

      {extracted && (
      <div className="mt-6 bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 text-left">
      <StatusBadge status={extracted.status} label={extracted.status === "DRAFT" ? "AI Draft — Unverified" : "Verified"} />
      <p className="font-display text-lg text-text mt-4">{extracted.documentType}</p>
      <p className="text-text-muted text-sm mt-1">Date: {extracted.date}</p>
      <p className="text-text-muted text-sm">Hospital: {extracted.hospital}</p>
      <p className="text-accent text-xs mt-4 italic">{explainDocument(extracted)}</p>
      </div>
      )}

      (add import StatusBadge from "../../../components/StatusBadge"; at top)

 main
    </div>
  );
}