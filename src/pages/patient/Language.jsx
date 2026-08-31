import { useNavigate } from "react-router-dom";

export default function Language() {
  const navigate = useNavigate();

  const selectLanguage = (lang) => {
    localStorage.setItem("clinovaLanguage", lang);
    navigate("/consent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌐</div>

          <h1 className="font-display text-2xl md:text-3xl font-semibold text-text">
            Choose Your Language
          </h1>

          <p className="text-text-muted mt-2">
            अपनी भाषा चुनें / Select your preferred language
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-4">

          {/* Hindi */}
          <button
            onClick={() => selectLanguage("hindi")}
            className="w-full border border-gray-200 bg-bg hover:border-primary hover:bg-surface rounded-xl p-4 transition text-left flex items-center justify-between group"
          >
            <div>
              <p className="text-lg font-semibold text-text">
                हिंदी
              </p>
              <p className="text-sm text-text-muted">
                हिंदी में जारी रखें
              </p>
            </div>

            <span className="text-xl text-text-muted group-hover:text-primary transition">
              →
            </span>
          </button>

          {/* English */}
          <button
            onClick={() => selectLanguage("english")}
            className="w-full border border-gray-200 bg-bg hover:border-primary hover:bg-surface rounded-xl p-4 transition text-left flex items-center justify-between group"
          >
            <div>
              <p className="text-lg font-semibold text-text">
                English
              </p>
              <p className="text-sm text-text-muted">
                Continue in English
              </p>
            </div>

            <span className="text-xl text-text-muted group-hover:text-primary transition">
              →
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
