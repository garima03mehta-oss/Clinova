import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Consent() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  // Get selected language
  const language =
    localStorage.getItem("clinovaLanguage") || "english";

  const isHindi = language === "hindi";

  const content = isHindi
    ? {
        title: "जानकारी और AI प्रोसेसिंग की सहमति",
        description:
          "Clinova आपकी स्वास्थ्य संबंधी जानकारी एकत्र और AI की सहायता से प्रोसेस करेगा, ताकि आपकी जानकारी को व्यवस्थित करके आपके डॉक्टर के लिए तैयार किया जा सके। आपकी अनुमति के बिना आपकी जानकारी किसी डॉक्टर या अन्य व्यक्ति के साथ साझा नहीं की जाएगी।",
        agree:
          "मैं अपनी स्वास्थ्य संबंधी जानकारी एकत्र और AI द्वारा प्रोसेस किए जाने के लिए सहमत हूँ।",
        continue: "जारी रखें",
      }
    : {
        title: "Consent for Information & AI Processing",
        description:
          "Clinova will collect and process your health information with the help of AI to organize and prepare it for your doctor. Your information will not be shared with a doctor or anyone else without your permission.",
        agree:
          "I agree to the collection and AI processing of my health information.",
        continue: "Continue",
      };

  const handleContinue = () => {
    if (!agreed) return;

    const profileComplete =
      localStorage.getItem("clinovaProfileComplete") === "true";

    // Existing patient → Dashboard
    if (profileComplete) {
      navigate("/patient/dashboard");
    } else {
      // New patient → Identification
      navigate("/identification");
    }
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

        <label className="flex items-start justify-center gap-3 text-text cursor-pointer mb-7 text-left">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-1 shrink-0"
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