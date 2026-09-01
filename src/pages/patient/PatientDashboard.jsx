import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  FileText,
  ShieldCheck,
  ClipboardList,
  Activity,
  ArrowRight,
  LogOut,
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const patientData = JSON.parse(
    localStorage.getItem("clinovaPatient") || "{}"
  );

  const patientId = localStorage.getItem("clinovaPatientId");

  const patientName =
    patientData.name ||
    (localStorage.getItem("clinovaLanguage") === "hindi"
      ? "मरीज़"
      : "Patient");

  // Get selected language
  const language =
    localStorage.getItem("clinovaLanguage") || "english";

  const isHindi = language === "hindi";

  const content = isHindi
    ? {
        dashboard: "मरीज़ डैशबोर्ड",

        greeting: `नमस्ते, ${patientName} 👋`,

        intro:
          "आज आप क्या करना चाहते हैं? अपनी स्वास्थ्य संबंधी जानकारी को प्रबंधित करने के लिए नीचे दिए गए विकल्पों में से चुनें।",

        patientId: "मरीज़ आईडी",

        logout: "लॉग आउट",

        actions: [
          {
            title: "प्री-रिपोर्ट तैयार करें",

            description:
              "अपने सेव किए गए मेडिकल दस्तावेज़ और क्लिनिकल जानकारी का उपयोग करके AI की सहायता से एक प्रारंभिक रिपोर्ट तैयार करें।",

            icon: Stethoscope,

            // DIRECT PRE-REPORT PAGE
            route: "/pre-report",

            badge: "AI सहायता",
          },

          {
            title: "मेरे दस्तावेज़",

            description:
              "अपनी मेडिकल रिपोर्ट, प्रिस्क्रिप्शन और स्कैन अपलोड करें, देखें और समझें।",

            icon: FileText,

            route: "/documents",

            badge: "दस्तावेज़",
          },

          {
            title: "डॉक्टर को एक्सेस दें",

            description:
              "वन-टाइम कोड या QR का उपयोग करके अपनी चुनी हुई मेडिकल जानकारी डॉक्टर के साथ सुरक्षित रूप से साझा करें।",

            icon: ShieldCheck,

            route: "/share-access",

            badge: "सुरक्षित",
          },

          {
            title: "मेरा मेडिकल रिकॉर्ड",

            description:
              "अपनी व्यक्तिगत जानकारी, एलर्जी, दवाइयाँ और मेडिकल इतिहास देखें।",

            icon: ClipboardList,

            route: "/health-record",

            badge: "स्वास्थ्य रिकॉर्ड",
          },

          {
            title: "स्वास्थ्य टाइमलाइन",

            description:
              "पिछली परामर्श, रिपोर्ट, प्रिस्क्रिप्शन और स्वास्थ्य संबंधी बदलावों को ट्रैक करें।",

            icon: Activity,

            route: "/timeline",

            badge: "टाइमलाइन",
          },
        ],

        open: "खोलें",

        privacyTitle:
          "आपकी स्वास्थ्य संबंधी जानकारी आपके नियंत्रण में रहती है",

        privacyDescription:
          "आप तय करते हैं कि आपकी मेडिकल जानकारी डॉक्टर के साथ कब और क्या साझा की जाए। AI द्वारा तैयार की गई जानकारी केवल एक प्रारंभिक ड्राफ्ट होती है और आधिकारिक क्लिनिकल रिकॉर्ड बनने से पहले डॉक्टर द्वारा सत्यापित की जानी आवश्यक है।",
      }
    : {
        dashboard: "PATIENT DASHBOARD",

        greeting: `Hi, ${patientName} 👋`,

        intro:
          "What would you like to do today? Choose an option below to manage your health information.",

        patientId: "Patient ID",

        logout: "Logout",

        actions: [
          {
            title: "Generate Pre-Report",

            description:
              "Use your saved medical documents and clinical information to prepare an AI-assisted preliminary report.",

            icon: Stethoscope,

            // DIRECT PRE-REPORT PAGE
            route: "/pre-report",

            badge: "AI Assisted",
          },

          {
            title: "My Documents",

            description:
              "Upload, view and understand your medical reports, prescriptions and scans.",

            icon: FileText,

            route: "/documents",

            badge: "Documents",
          },

          {
            title: "Give Doctor Access",

            description:
              "Securely share selected medical records with your doctor using a one-time code or QR.",

            icon: ShieldCheck,

            route: "/share-access",

            badge: "Secure",
          },

          {
            title: "My Medical Record",

            description:
              "View your personal details, allergies, medications and medical history.",

            icon: ClipboardList,

            route: "/health-record",

            badge: "Health Record",
          },

          {
            title: "Health Timeline",

            description:
              "Track previous consultations, reports, prescriptions and health trends.",

            icon: Activity,

            route: "/timeline",

            badge: "Timeline",
          },
        ],

        open: "Open",

        privacyTitle:
          "Your health information stays under your control",

        privacyDescription:
          "You decide when and what medical information is shared with a doctor. AI-generated information is only a preliminary draft and requires doctor verification before becoming an official clinical record.",
      };

  const handleLogout = () => {
    localStorage.removeItem("clinovaPatientId");

    localStorage.removeItem("clinovaPatient");

    localStorage.removeItem("clinovaProfileComplete");

    localStorage.removeItem("clinovaLanguage");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-gray-200 bg-surface">

        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="font-display text-2xl font-semibold text-text">
              Clinova
            </h1>

            <p className="text-sm text-text-muted">
              {isHindi
                ? "मरीज़ स्वास्थ्य डैशबोर्ड"
                : "Patient Health Dashboard"}
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-text-muted hover:text-danger hover:border-danger transition"
          >

            <LogOut size={17} />

            <span className="hidden sm:inline">
              {content.logout}
            </span>

          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ===================================================
            GREETING
        =================================================== */}

        <section className="mb-10">

          <p className="text-sm font-medium text-primary mb-2">
            {content.dashboard}
          </p>

          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            {content.greeting}
          </h2>

          <p className="text-text-muted text-base md:text-lg max-w-2xl">
            {content.intro}
          </p>

          {patientId && (
            <p className="text-xs text-text-muted mt-3">
              {content.patientId}: {patientId}
            </p>
          )}

        </section>

        {/* ===================================================
            ACTION CARDS
        =================================================== */}

        <section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {content.actions.map((action) => {

              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.route)}
                  className="group text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >

                  {/* ICON + BADGE */}

                  <div className="flex items-start justify-between mb-5">

                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

                      <Icon
                        className="text-primary"
                        size={25}
                      />

                    </div>

                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {action.badge}
                    </span>

                  </div>

                  {/* CONTENT */}

                  <h3 className="font-display text-xl font-semibold mb-2">
                    {action.title}
                  </h3>

                  <p className="text-sm text-text-muted leading-6 min-h-[72px]">
                    {action.description}
                  </p>

                  {/* ACTION */}

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">

                    {content.open}

                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform"
                    />

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            PRIVACY / INFORMATION CARD
        =================================================== */}

        <section className="mt-8">

          <div className="bg-surface border border-gray-200 rounded-2xl p-5 flex gap-4 items-start">

            <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">

              <ShieldCheck
                className="text-primary"
                size={21}
              />

            </div>

            <div>

              <h3 className="font-semibold mb-1">
                {content.privacyTitle}
              </h3>

              <p className="text-sm text-text-muted leading-6">
                {content.privacyDescription}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}