import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientWorkspace() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const storedPatient =
      localStorage.getItem("clinovaSelectedPatient");

    if (!storedPatient) {
      navigate("/doctor/queue");
      return;
    }

    try {
      setPatient(JSON.parse(storedPatient));
    } catch (error) {
      console.error("Unable to read selected patient:", error);
      navigate("/doctor/queue");
    }
  }, [navigate]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted">
          Loading patient...
        </p>
      </div>
    );
  }

  const patientName =
    patient.patientName ||
    patient.name ||
    "Patient";

  const patientId =
    patient.patientId ||
    "Not available";

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => navigate("/doctor/queue")}
            className="text-primary text-sm font-medium mb-4"
          >
            ← Back to My Patients
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                👤
              </div>

              <div>
                <p className="text-text-muted text-sm">
                  Patient Workspace
                </p>

                <h1 className="font-display text-2xl font-semibold text-text">
                  {patientName}
                </h1>

                <p className="text-text-muted text-sm mt-1">
                  Patient ID: {patientId}
                </p>
              </div>

            </div>

            <span className="inline-flex w-fit px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
              ● Active Access
            </span>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PATIENT OVERVIEW */}
        <section className="mb-8">

          <h2 className="font-display text-xl font-semibold text-text">
            Patient Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <div className="bg-surface border border-gray-100 rounded-2xl p-5">
              <p className="text-text-muted text-sm">
                Access Status
              </p>

              <p className="text-green-700 font-semibold mt-2">
                Active
              </p>
            </div>

            <div className="bg-surface border border-gray-100 rounded-2xl p-5">
              <p className="text-text-muted text-sm">
                Clinical Summary
              </p>

              <p className="text-text font-semibold mt-2">
                {patient.scope?.clinicalSummary
                  ? "Shared"
                  : "Not shared"}
              </p>
            </div>

            <div className="bg-surface border border-gray-100 rounded-2xl p-5">
              <p className="text-text-muted text-sm">
                Medical Reports
              </p>

              <p className="text-text font-semibold mt-2">
                {patient.scope?.reports
                  ? "Shared"
                  : "Not shared"}
              </p>
            </div>

          </div>
        </section>

        {/* CLINICAL WORKSPACE */}
        <section>

          <div className="mb-5">
            <h2 className="font-display text-xl font-semibold text-text">
              Clinical Workspace
            </h2>

            <p className="text-text-muted text-sm mt-1">
              Review the patient's shared medical information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* SUMMARY */}
            <button
              onClick={() => navigate("/doctor/summary")}
              disabled={!patient.scope?.clinicalSummary}
              className={`text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm transition ${
                patient.scope?.clinicalSummary
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="text-3xl mb-4">
                🩺
              </div>

              <h3 className="font-semibold text-text text-lg">
                Clinical Summary
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review the structured clinical summary
                available for this patient.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review Summary →
              </p>
            </button>

            {/* REPORTS */}
            <button
              onClick={() => navigate("/doctor/patient-documents")}
              disabled={!patient.scope?.reports}
              className={`text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm transition ${
                patient.scope?.reports
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="text-3xl mb-4">
                📄
              </div>

              <h3 className="font-semibold text-text text-lg">
                Medical Reports
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                View reports shared by the patient and
                review AI-extracted information.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                View Reports →
              </p>
            </button>

            {/* TIMELINE */}
            <button
              onClick={() => navigate("/doctor/patient-timeline")}
              disabled={!patient.scope?.timeline}
              className={`text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm transition ${
                patient.scope?.timeline
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="text-3xl mb-4">
                🕒
              </div>

              <h3 className="font-semibold text-text text-lg">
                Medical Timeline
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Follow important medical events and
                records over time.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                View Timeline →
              </p>
            </button>

            {/* ATTENTION */}
            <button
              onClick={() => navigate("/doctor/attention")}
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-4">
                ⚠️
              </div>

              <h3 className="font-semibold text-text text-lg">
                What Needs Attention
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review incomplete information and
                important clinical alerts.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review Alerts →
              </p>
            </button>

            {/* VERIFICATION */}
            <button
              onClick={() => navigate("/doctor/verification")}
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-4">
                ✅
              </div>

              <h3 className="font-semibold text-text text-lg">
                Verify Clinical Draft
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review AI-generated information before
                considering it an official clinical record.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review & Verify →
              </p>
            </button>

            {/* SECURITY */}
            <button
              onClick={() => navigate("/doctor/audit-log")}
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-4">
                🔐
              </div>

              <h3 className="font-semibold text-text text-lg">
                Access & Security
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review access activity related to this
                patient's shared records.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                View Audit Log →
              </p>
            </button>

          </div>
        </section>

        {/* PRIVACY NOTICE */}
        <div className="mt-8 bg-surface border border-gray-100 rounded-2xl p-5">

          <p className="text-text text-sm font-semibold">
            🔒 Patient-controlled access
          </p>

          <p className="text-text-muted text-sm mt-2 leading-6">
            Only information included in the patient's active
            sharing permission should be accessed. AI-generated
            content is a draft and requires professional review.
          </p>

        </div>

      </main>
    </div>
  );
}