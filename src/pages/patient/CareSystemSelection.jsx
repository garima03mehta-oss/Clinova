import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function CareSystemSelection() {
  const navigate = useNavigate();

  const [previousSelection, setPreviousSelection] =
    useState(null);

  const [language, setLanguage] = useState("english");

  useEffect(() => {
    const saved =
      localStorage.getItem("clinovaCareSystem");

    if (saved) {
      setPreviousSelection(saved);
    }

    const savedLanguage =
      localStorage.getItem("clinovaLanguage");

    if (savedLanguage) {
      setLanguage(savedLanguage.toLowerCase());
    }
  }, []);

  const isHindi =
    language === "hindi" ||
    language === "hi";

  const selectCareSystem = async (system) => {
    try {
      const patientId =
        localStorage.getItem("clinovaPatientId");

      if (patientId) {
        await updateDoc(
          doc(db, "patients", patientId),
          {
            careSystem: system,
          }
        );
      }

      localStorage.setItem(
        "clinovaCareSystem",
        system
      );

      navigate("/interview");
    } catch (error) {
      console.error(
        "Failed to save care system:",
        error
      );
    }
  };

  const getSystemName = (system) => {
    if (system === "allopathy") {
      return isHindi ? "एलोपैथी" : "Allopathy";
    }

    if (system === "ayush") {
      return isHindi ? "आयुष" : "AYUSH";
    }

    if (system === "both") {
      return isHindi
        ? "दोनों"
        : "Both";
    }

    return system;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#F6F8F7",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "32px",
          textAlign: "center",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            color: "#1F2937",
            marginBottom: "10px",
          }}
        >
          {isHindi
            ? "इस परामर्श के लिए चिकित्सा पद्धति चुनें"
            : "Care System for This Consultation"}
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          {isHindi
            ? "चुनें कि आप Clinova से अपना क्लिनिकल इंटरव्यू किस चिकित्सा पद्धति के अनुसार करवाना चाहते हैं।"
            : "Choose how you would like Clinova to conduct your clinical intake."}
        </p>

        {previousSelection && (
          <p
            style={{
              color: "#6B7280",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {isHindi
              ? "पिछली बार आपने चुना था:"
              : "Last time you chose:"}{" "}
            <strong>
              {getSystemName(previousSelection)}
            </strong>
            {isHindi
              ? "। आप इसे आज बदल सकते हैं।"
              : ". You can change this for today."}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            onClick={() =>
              selectCareSystem("allopathy")
            }
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "2px solid #0E6E64",
              background: "#0E6E64",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🩺 {isHindi ? "एलोपैथी" : "Allopathy"}
          </button>

          <button
            onClick={() =>
              selectCareSystem("ayush")
            }
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "2px solid #0E6E64",
              background: "#FFFFFF",
              color: "#0E6E64",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🌿 {isHindi ? "आयुष" : "AYUSH"}
          </button>

          <button
            onClick={() =>
              selectCareSystem("both")
            }
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "2px solid #0E6E64",
              background: "#FFFFFF",
              color: "#0E6E64",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🔄 {isHindi ? "दोनों" : "Both"}
          </button>
        </div>
      </div>
    </div>
  );
}
