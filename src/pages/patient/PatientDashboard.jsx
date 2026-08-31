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

  const patientName = patientData.name || "Patient";

  const actions = [
    {
      title: "Generate Pre-Report",
      description:
        "Share your symptoms and answer guided questions to prepare an AI-assisted preliminary report.",
      icon: Stethoscope,
      route: "/care-system",
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
  ];

  const handleLogout = () => {
    localStorage.removeItem("clinovaPatientId");
    localStorage.removeItem("clinovaPatient");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text">
      {/* Header */}
      <header className="border-b border-gray-200 bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text">
              Clinova
            </h1>
            <p className="text-sm text-text-muted">
              Patient Health Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-text-muted hover:text-danger hover:border-danger transition"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting */}
        <section className="mb-10">
          <p className="text-sm font-medium text-primary mb-2">
            PATIENT DASHBOARD
          </p>

          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            Hi, {patientName} 👋
          </h2>

          <p className="text-text-muted text-base md:text-lg max-w-2xl">
            What would you like to do today? Choose an option below to manage
            your health information.
          </p>

          {patientId && (
            <p className="text-xs text-text-muted mt-3">
              Patient ID: {patientId}
            </p>
          )}
        </section>

        {/* Action Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.route)}
                  className="group text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="text-primary" size={25} />
                    </div>

                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {action.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {action.title}
                  </h3>

                  <p className="text-sm text-text-muted leading-6 min-h-[72px]">
                    {action.description}
                  </p>

                  {/* Action */}
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                    Open
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

        {/* Information Card */}
        <section className="mt-8">
          <div className="bg-surface border border-gray-200 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="text-primary" size={21} />
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                Your health information stays under your control
              </h3>

              <p className="text-sm text-text-muted leading-6">
                You decide when and what medical information is shared with a
                doctor. AI-generated information is only a preliminary draft
                and requires doctor verification before becoming an official
                clinical record.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}