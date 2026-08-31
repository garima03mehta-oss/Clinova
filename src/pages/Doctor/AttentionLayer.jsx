import { useLocation, useNavigate } from "react-router-dom";

export default function AttentionLayer() {
  const navigate = useNavigate();
  const location = useLocation();

  let patient = location.state?.patient || null;

  if (!patient) {
    try {
      const storedPatient = localStorage.getItem(
        "clinovaSelectedPatient"
      );

      if (storedPatient) {
        patient = JSON.parse(storedPatient);
      }
    } catch (error) {
      console.error(
        "Unable to load selected patient:",
        error
      );
    }
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6 font-body">

        <div className="bg-surface border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">

          <div className="text-5xl mb-4">
            👤
          </div>

          <h1 className="text-xl font-semibold text-text">
            Patient Not Selected
          </h1>

          <p className="text-text-muted text-sm mt-2 leading-6">
            Please select a patient from Patient Requests before
            reviewing attention items.
          </p>

          <button
            onClick={() => navigate("/doctor/queue")}
            className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-medium"
          >
            Go to Patient Requests
          </button>

        </div>

      </div>
    );
  }

  const summary = patient.clinicalSummary || {};

  const patientName =
    patient.patientName ||
    patient.name ||
    "Patient";

  const patientId =
    patient.patientId ||
    "Not available";

  const alerts = [];

  /*
   * PRIORITY SYMPTOM CHECK
   */
  const clinicalText = `
    ${summary.chiefComplaint || ""}
    ${summary.hpi || ""}
  `.toLowerCase();

  const hasChestPain =
    clinicalText.includes("chest pain");

  const hasBreathingDifficulty =
    clinicalText.includes("breathing") ||
    clinicalText.includes("breathlessness") ||
    clinicalText.includes("shortness of breath");

  if (hasChestPain && hasBreathingDifficulty) {
    alerts.push({
      type: "priority",
      title: "Potential Priority Symptoms",
      message:
        "Chest pain with breathing difficulty is present in the available clinical information.",
      icon: "🚨",
    });
  }

  /*
   * ALLERGY CHECK
   */
  if (
    !summary.allergyHistory ||
    summary.allergyHistory === "Not provided"
  ) {
    alerts.push({
      type: "incomplete",
      title: "Allergy History Incomplete",
      message:
        "Allergy information is missing or incomplete in the available patient record.",
      icon: "⚠️",
    });
  }

  /*
   * MEDICATION CHECK
   */
  if (
    !summary.medicationHistory ||
    summary.medicationHistory === "Not provided"
  ) {
    alerts.push({
      type: "incomplete",
      title: "Medication History Incomplete",
      message:
        "Medication history is not available in the current patient record.",
      icon: "💊",
    });
  }

  /*
   * REPORT CHECK
   */
  if (
    Array.isArray(patient.reports) &&
    patient.reports.length > 0
  ) {
    alerts.push({
      type: "info",
      title: "Medical Reports Available",
      message: `${patient.reports.length} medical report${
        patient.reports.length > 1 ? "s are" : " is"
      } available in the authorized patient record.`,
      icon: "📄",
    });
  }

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <p className="text-primary text-xs font-bold tracking-wider">
              CLINOVA • DOCTOR PORTAL
            </p>

            <h1 className="font-display text-2xl font-semibold text-text mt-1">
              What Needs Your Attention?
            </h1>

            <p className="text-sm text-text-muted mt-1">
              Review important clinical information before
              continuing with this patient's record.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/doctor/summary", {
                state: { patient },
              })
            }
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-text hover:bg-gray-50"
          >
            ← Clinical Summary
          </button>

        </div>

      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* PATIENT */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>

              <p className="text-xs text-text-muted uppercase tracking-wide">
                Patient
              </p>

              <h2 className="text-xl font-semibold text-text mt-1">
                {patientName}
              </h2>

              <p className="text-sm text-text-muted mt-1">
                Patient ID: {patientId}
              </p>

            </div>

          </div>

        </section>

        {/* ALERTS */}
        <section className="space-y-4">

          {alerts.length === 0 ? (

            <div className="bg-surface border border-gray-200 rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                ✅
              </div>

              <h2 className="text-xl font-semibold text-text">
                No Attention Items
              </h2>

              <p className="text-text-muted text-sm mt-2">
                No specific attention items were detected from
                the currently available patient information.
              </p>

            </div>

          ) : (

            alerts.map((alert, index) => {

              let containerClass =
                "bg-gray-50 border-gray-200";

              let iconClass =
                "bg-gray-100";

              let titleClass =
                "text-text";

              let messageClass =
                "text-text-muted";

              if (alert.type === "priority") {
                containerClass =
                  "bg-red-50 border-red-200";
                iconClass =
                  "bg-red-100";
                titleClass =
                  "text-red-800";
                messageClass =
                  "text-red-700";
              }

              if (alert.type === "incomplete") {
                containerClass =
                  "bg-orange-50 border-orange-200";
                iconClass =
                  "bg-orange-100";
                titleClass =
                  "text-orange-800";
                messageClass =
                  "text-orange-700";
              }

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-5 ${containerClass}`}
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
                    >
                      {alert.icon}
                    </div>

                    <div>

                      <h3
                        className={`font-semibold ${titleClass}`}
                      >
                        {alert.title}
                      </h3>

                      <p
                        className={`text-sm mt-1 leading-6 ${messageClass}`}
                      >
                        {alert.message}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })

          )}

        </section>

        {/* ACTIONS */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 mt-6">

          <h2 className="font-semibold text-text">
            Continue Clinical Review
          </h2>

          <p className="text-sm text-text-muted mt-1">
            Review the clinical summary and verify the AI-generated
            information before making it official.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">

            <button
              onClick={() =>
                navigate("/doctor/summary", {
                  state: { patient },
                })
              }
              className="flex-1 border border-gray-300 text-text py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              🩺 Back to Clinical Summary
            </button>

            <button
              onClick={() =>
                navigate("/doctor/verification", {
                  state: { patient },
                })
              }
              className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90"
            >
              ✓ Continue to Verification
            </button>

          </div>

        </section>

        {/* PRIVACY */}
        <div className="mt-6 flex gap-3 items-start px-1">

          <span className="text-lg">
            🔒
          </span>

          <p className="text-xs text-text-muted leading-5">
            Attention items are generated from the information
            available in the authorized patient record. They are
            intended to assist clinical review and should not
            replace professional judgment.
          </p>

        </div>

      </main>

    </div>
  );
}