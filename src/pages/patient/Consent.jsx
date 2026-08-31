import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Consent() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  // Get selected language
  const language = localStorage.getItem("clinovaLanguage") || "english";

  const isHindi = language === "hindi";

  const content = isHindi
    ? {
        title: "जानकारी एकत्र करने की सहमति",
        description:
          "Clinova आपकी स्वास्थ्य संबंधी जानकारी एकत्र करेगा ताकि इसे आपके डॉक्टर के लिए तैयार किया जा सके। आपकी अनुमति के बिना इसे अभी किसी के साथ साझा नहीं किया जाएगा।",
        agree: "मैं सहमत हूँ",
        continue: "जारी रखें",
      }
    : {
        title: "Consent to Collect Information",
        description:
          "Clinova will collect your health information to prepare it for your doctor. This does not share it with anyone yet.",
        agree: "I Agree",
        continue: "Continue",
      };

  const handleContinue = () => {
    if (!agreed) return;
    navigate("/identification");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

        <h1 className="font-display text-2xl md:text-3xl font-semibold text-text mb-4">
          {content.title}
        </h1>

        <p className="text-text-muted leading-7 mb-7">
          {content.description}
        </p>

        <label className="flex items-center justify-center gap-3 text-text cursor-pointer mb-7">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4"
          />

          <span>{content.agree}</span>
        </label>

        <button
          disabled={!agreed}
          onClick={handleContinue}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {content.continue}
        </button>

      </div>
    </div>
  );
}