// src/pages/patient/PreReport.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreReport() {
  const navigate = useNavigate();

  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateReport();
  }, []);

  const getLocalStorageData = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (err) {
      console.error(`Failed to read ${key}:`, err);
      return fallback;
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");
      setReport("");

      /*
       * Interview information
       */
      const history = getLocalStorageData(
        "clinovaInterviewHistory",
        {}
      );

      /*
       * Documents are OPTIONAL.
       *
       * If patient has not uploaded any document,
       * an empty array will be sent.
       */
      const documents = getLocalStorageData(
        "clinovaDocuments",
        []
      );

      console.log("Generating pre-report with:", {
        history,
        documents,
      });

      /*
       * IMPORTANT:
       * Documents are optional.
       * Pre-report should work even when documents = [].
       */
      const response = await fetch(
        "/api/generatePreReport",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            history,
            documents,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      console.log("Pre-report API response:", data);

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
      setLoading(false);
    }
  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F8F7",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
            maxWidth: "520px",
            width: "100%",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "15px",
            }}
          >
            🤖
          </div>

          <h2
            style={{
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            Preparing your pre-consultation report
          </h2>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Clinova is organizing your
            interview responses
            {` `}
            {`and any available medical records.`}
          </p>

          <div
            style={{
              marginTop: "20px",
              color: "#0E6E64",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Please wait...
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR SCREEN
  ========================= */

  if (error) {
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
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color: "#B91C1C",
              marginTop: 0,
            }}
          >
            Unable to generate report
          </h2>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>

          <div
            style={{
              marginTop: "15px",
              padding: "14px",
              background: "#F9FAFB",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#6B7280",
            }}
          >
            You can try generating the report
            again. A medical document is optional
            and is not required to generate the
            pre-consultation report.
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "22px",
              flexWrap: "wrap",
            }}
          >
            {/* TRY AGAIN */}

            <button
              onClick={generateReport}
              style={{
                padding: "13px 20px",
                border: "none",
                borderRadius: "10px",
                background: "#0E6E64",
                color: "#FFFFFF",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🔄 Try Again
            </button>

            {/* ADD DOCUMENT */}

            <button
              onClick={() =>
                navigate("/documents")
              }
              style={{
                padding: "13px 20px",
                border:
                  "1px solid #0E6E64",
                borderRadius: "10px",
                background: "#FFFFFF",
                color: "#0E6E64",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📄 Add Document
            </button>

            {/* DASHBOARD */}

            <button
              onClick={() =>
                navigate("/patient")
              }
              style={{
                padding: "13px 20px",
                border:
                  "1px solid #D1D5DB",
                borderRadius: "10px",
                background: "#FFFFFF",
                color: "#374151",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     REPORT SCREEN
  ========================= */

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
          background: "#FFFFFF",
          padding: "32px",
          borderRadius: "20px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
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

            <p
              style={{
                color: "#6B7280",
                marginTop: "10px",
                lineHeight: 1.5,
              }}
            >
              A structured summary of the
              information provided during your
              clinical interview and available
              medical records.
            </p>
          </div>

          <span
            style={{
              padding: "7px 12px",
              borderRadius: "999px",
              background: "#FFF7ED",
              color: "#C2410C",
              fontSize: "12px",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
          >
            AI DRAFT • UNVERIFIED
          </span>
        </div>

        {/* REPORT */}

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

        {/* DISCLAIMER */}

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
          <strong>Important:</strong>{" "}
          This is an AI-generated draft based
          only on the information provided. It is
          not a diagnosis or a treatment
          recommendation and should be reviewed
          by a qualified healthcare professional.
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "22px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() =>
              navigate("/documents")
            }
            style={{
              flex: 1,
              minWidth: "200px",
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
            📄 View / Add Documents
          </button>

          <button
            onClick={() =>
              navigate("/patient")
            }
            style={{
              flex: 1,
              minWidth: "200px",
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
            🏠 Back to Patient Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}