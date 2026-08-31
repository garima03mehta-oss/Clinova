import { useLocation, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";

export default function ClinicalSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get patient from navigation state first,
  // then fallback to localStorage for page refresh/direct access.
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
      console.error("Unable to load selected patient:", error);
    }
  }

  const summary = patient?.clinicalSummary || {};

  const patientName =
    patient?.patientName ||
    patient?.name ||
    "Patient";

  const patientId =
    patient?.patientId ||
    "Not available";

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "Not provided"
    ) {
      return null;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      return value
        .map((item) =>
          typeof item === "object"
            ? JSON.stringify(item)
            : String(item)
        )
        .join(", ");
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join("\n");
    }

    return String(value);
  };

  const renderValue = (value) => {
    const formatted = formatValue(value);

    if (!formatted) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-sm">
          Not provided
        </span>
      );
    }

    return (
      <p className="text-text leading-7 whitespace-pre-line">
        {formatted}
      </p>
    );
  };

  const historyItems = [
    {
      title: "Medication History",
      value: summary.medicationHistory,
      icon: "💊",
    },
    {
      title: "Allergy History",
      value: summary.allergyHistory,
      icon: "⚠️",
    },
    {
      title: "Family History",
      value: summary.familyHistory,
      icon: "👨‍👩‍👧",
    },
    {
      title: "Additional Information",
      value: summary.additionalInformation,
      icon: "📋",
    },
  ];

  if (!patient) {
    return (
      <div className="min-h-screen bg-bg font-body flex items-center justify-center px-6">
        <div className="bg-surface border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">👤</div>

          <h1 className="text-xl font-semibold text-text">
            Patient Not Selected
          </h1>

          <p className="text-text-muted text-sm mt-2 leading-6">
            Please select a patient from the Patient Requests
            section before viewing the clinical summary.
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

  return (
    <div className="min-h-screen bg-bg font-body text-text">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-primary text-xs font-bold tracking-wider">
                CLINOVA • DOCTOR PORTAL
              </p>

              <h1 className="font-display text-2xl font-semibold mt-1">
                Clinical Summary
              </h1>

              <p className="text-sm text-text-muted mt-1">
                Structured review of the patient's available clinical information
              </p>
            </div>

            <button
              onClick={() => navigate("/doctor/queue")}
              className="w-fit px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
            >
              ← Patient Requests
            </button>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PATIENT INFORMATION */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                👤
              </div>

              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Patient
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  {patientName}
                </h2>

                <p className="text-sm text-text-muted mt-1">
                  Patient ID: {patientId}
                </p>
              </div>

            </div>

            <div className="flex flex-col items-start lg:items-end gap-2">

              <StatusBadge
                status="DRAFT"
                label="AI-Generated Clinical Draft"
              />

              <p className="text-xs text-text-muted">
                Physician verification required
              </p>

            </div>

          </div>

        </section>

        {/* AI WARNING */}
        <section className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">

          <div className="flex gap-4 items-start">

            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-lg">
              ⚠️
            </div>

            <div>
              <h3 className="font-semibold text-orange-900">
                Physician Review Required
              </h3>

              <p className="text-sm text-orange-800 mt-1 leading-6">
                This is an AI-generated draft based on the
                information available in the patient's record.
                Verify the information against the original
                patient records before treating it as an official
                clinical record.
              </p>
            </div>

          </div>

        </section>

        {/* PRESENTING COMPLAINT + HPI */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* PRESENTING COMPLAINT */}
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  🩺
                </div>

                <div>
                  <h2 className="font-semibold text-lg">
                    Presenting Complaint
                  </h2>

                  <p className="text-xs text-text-muted mt-1">
                    Primary reason for the current visit
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6">
              {renderValue(summary.chiefComplaint)}
            </div>

          </div>

          {/* HPI */}
          <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  📝
                </div>

                <div>
                  <h2 className="font-semibold text-lg">
                    History of Present Illness
                  </h2>

                  <p className="text-xs text-text-muted mt-1">
                    Current symptoms and relevant history
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6">
              {renderValue(summary.hpi)}
            </div>

          </div>

        </section>

        {/* PATIENT HISTORY */}
        <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

          <div className="px-6 py-5 border-b border-gray-200">

            <h2 className="font-semibold text-lg">
              Patient History
            </h2>

            <p className="text-sm text-text-muted mt-1">
              Relevant background information available in the
              patient's record.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

            {historyItems.map((item) => {

              const hasValue = !!formatValue(item.value);

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-surface border border-gray-200 flex items-center justify-center">
                        {item.icon}
                      </div>

                      <h3 className="font-semibold text-sm">
                        {item.title}
                      </h3>

                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        hasValue
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {hasValue ? "Available" : "Incomplete"}
                    </span>

                  </div>

                  <div className="mt-4 text-sm">
                    {renderValue(item.value)}
                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* INVESTIGATIONS & REPORTS */}
        <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                📄
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  Investigations & Medical Reports
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  Reports available through the authorized patient record
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            {Array.isArray(patient.reports) &&
            patient.reports.length > 0 ? (

              <div className="space-y-3">

                {patient.reports.map((report, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        📄
                      </div>

                      <div>

                        <p className="font-medium text-text">
                          {report?.name ||
                            report?.documentType ||
                            `Medical Report ${index + 1}`}
                        </p>

                        {report?.date && (
                          <p className="text-xs text-text-muted mt-1">
                            Report date: {report.date}
                          </p>
                        )}

                      </div>

                    </div>

                    <span className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium">
                      Available
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">

                <div className="text-4xl mb-3">
                  📄
                </div>

                <h3 className="font-medium text-text">
                  No Medical Reports Available
                </h3>

                <p className="text-sm text-text-muted mt-1">
                  No reports were included in the current
                  authorized sharing session.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* AI EXPLANATION */}
        <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                ✨
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  AI Patient-Friendly Explanation
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  Simplified explanation generated from available information
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">

              {formatValue(summary.aiExplanation) ? (

                <p className="text-sm text-text leading-7 whitespace-pre-line">
                  {formatValue(summary.aiExplanation)}
                </p>

              ) : (

                <div className="text-center py-5">

                  <div className="text-3xl mb-2">
                    💬
                  </div>

                  <p className="text-sm text-text-muted">
                    No patient-friendly explanation is available.
                  </p>

                </div>

              )}

            </div>

          </div>

        </section>

        {/* REVIEW ACTIONS */}
        <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h2 className="font-semibold text-lg">
                Clinical Review
              </h2>

              <p className="text-sm text-text-muted mt-1 leading-6">
                Review attention items and verify the AI-generated
                draft before considering it an official clinical record.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  navigate("/doctor/attention", {
                    state: { patient },
                  })
                }
                className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-medium text-text hover:bg-gray-50 transition"
              >
                🚨 Review Attention
              </button>

              <button
                onClick={() =>
                  navigate("/doctor/verification", {
                    state: { patient },
                  })
                }
                className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition"
              >
                ✓ Continue to Official Review
              </button>

            </div>

          </div>

        </section>

        {/* PRIVACY NOTE */}
        <div className="mt-6 flex gap-3 items-start px-1">

          <span className="text-lg">
            🔒
          </span>

          <p className="text-xs text-text-muted leading-5">
            Patient information shown here is available only
            through the patient's authorized sharing session.
            AI-generated content remains a draft until reviewed
            by a qualified physician.
          </p>

        </div>

      </main>

    </div>
  );
}
