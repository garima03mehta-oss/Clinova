import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { generateAccessCode } from "../../utils/accessCode";

export default function ShareAccess() {
  const [scope, setScope] = useState({
    clinicalSummary: true,
    timeline: true,
    reports: false,
  });

  const [duration, setDuration] = useState(60);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleScope = (key) => {
    setScope((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerate = async () => {
    const patientId = localStorage.getItem("clinovaPatientId");

    if (!patientId) {
      setError(
        "Patient information not found. Please log in again."
      );
      return;
    }

    if (
      !scope.clinicalSummary &&
      !scope.timeline &&
      !scope.reports
    ) {
      setError(
        "Please select at least one item to share."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAccess(null);

    try {
      const newAccess = generateAccessCode(
        scope,
        duration
      );

      const docRef = await addDoc(
        collection(db, "accessRequests"),
        {
          ...newAccess,
          patientId,
          createdAt: Date.now(),
        }
      );

      setAccess({
        ...newAccess,
        id: docRef.id,
      });
    } catch (err) {
      console.error(
        "Access generation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to generate secure doctor access."
      );
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: "650px",
          margin: "0 auto",
          background: "#FFFFFF",
          padding: "32px",
          borderRadius: "20px",
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
          CLINOVA • SECURE SHARING
        </p>

        <h1
          style={{
            color: "#1F2937",
            margin: 0,
            marginBottom: "10px",
          }}
        >
          Share With Doctor
        </h1>

        <p
          style={{
            color: "#6B7280",
            lineHeight: 1.6,
            marginTop: 0,
          }}
        >
          Choose which parts of your medical
          information you want to share with
          your doctor.
        </p>

        {/* INFORMATION TO SHARE */}

        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h3
            style={{
              color: "#1F2937",
            }}
          >
            Information to share
          </h3>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="checkbox"
              checked={scope.clinicalSummary}
              onChange={() =>
                toggleScope("clinicalSummary")
              }
            />{" "}
            Clinical Summary
          </label>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="checkbox"
              checked={scope.timeline}
              onChange={() =>
                toggleScope("timeline")
              }
            />{" "}
            Medical Timeline
          </label>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="checkbox"
              checked={scope.reports}
              onChange={() =>
                toggleScope("reports")
              }
            />{" "}
            Medical Reports
          </label>
        </div>

        {/* ACCESS DURATION */}

        <div
          style={{
            marginTop: "28px",
          }}
        >
          <h3
            style={{
              color: "#1F2937",
            }}
          >
            Access duration
          </h3>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="radio"
              name="duration"
              checked={duration === 60}
              onChange={() =>
                setDuration(60)
              }
            />{" "}
            1 Hour
          </label>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="radio"
              name="duration"
              checked={duration === 1440}
              onChange={() =>
                setDuration(1440)
              }
            />{" "}
            24 Hours
          </label>

          <label
            style={{
              display: "block",
              marginTop: "14px",
              color: "#374151",
            }}
          >
            <input
              type="radio"
              name="duration"
              checked={duration === 10080}
              onChange={() =>
                setDuration(10080)
              }
            />{" "}
            7 Days
          </label>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
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

        {/* GENERATE BUTTON */}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "25px",
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
            ? "Generating..."
            : "Generate Secure Access"}
        </button>

        {/* ACCESS CODE */}

        {access && (
          <div
            style={{
              marginTop: "25px",
              padding: "22px",
              borderRadius: "14px",
              background: "#EAF5F3",
              border:
                "1px solid #B7DED8",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#084C44",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Give this secure code to your
              doctor
            </p>

            <p
              style={{
                color: "#6B7280",
                fontSize: "12px",
                textTransform:
                  "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Secure Access Code
            </p>

            <h2
              style={{
                fontSize: "32px",
                letterSpacing: "4px",
                color: "#0E6E64",
                margin: "8px 0",
                fontFamily:
                  "monospace",
              }}
            >
              {access.code}
            </h2>

            <p
              style={{
                color: "#6B7280",
                marginTop: "12px",
              }}
            >
              Status:{" "}
              <strong>
                {access.status}
              </strong>
            </p>

            <p
              style={{
                fontSize: "13px",
                color: "#6B7280",
                lineHeight: 1.5,
                marginBottom: 0,
              }}
            >
              Give this code to your doctor.
              Access expires automatically
              according to the duration you
              selected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}