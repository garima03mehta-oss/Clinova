import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientWorkspace() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPatient = localStorage.getItem(
        "clinovaSelectedPatient"
      );

      if (!storedPatient) {
        navigate("/doctor/queue");
        return;
      }

      const parsedPatient = JSON.parse(storedPatient);

      if (!parsedPatient || typeof parsedPatient !== "object") {
        navigate("/doctor/queue");
        return;
      }

      setPatient(parsedPatient);
    } catch (error) {
      console.error(
        "Unable to load selected patient:",
        error
      );

      localStorage.removeItem("clinovaSelectedPatient");
      navigate("/doctor/queue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-3">👤</div>

          <p className="text-text-muted">
            Loading patient workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const patientName =
    patient.patientName ||
    patient.name ||
    "Patient";

  const patientId =
    patient.patientId ||
    patient.id ||
    "Not available";

  const scope = patient.scope || {};

  const hasClinicalSummary =
    scope.clinicalSummary !== false;

  const hasReports =
    scope.reports !== false;

  const hasTimeline =
    scope.timeline !== false;

  const goToPage = (path) => {
    navigate(path, {
      state: {
        patient,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => navigate("/doctor/queue")}
            className="text-primary text-sm font-medium mb-5 hover:underline"
          >
            ← Back to Patient Requests
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                👤
              </div>

              <div>

                <p className="text-text-muted text-xs uppercase tracking-wider">
                  Patient Workspace
                </p>

                <h1 className="font-display text-2xl font-semibold mt-1">
                  {patientName}
                </h1>

                <p className="text-text-muted text-sm mt-1">
                  Patient ID: {patientId}
                </p>

              </div>

            </div>

            <div className="inline-flex w-fit px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
              ● Active Access
            </div>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* OVERVIEW */}
        <section className="mb-8">

          <h2 className="font-display text-xl font-semibold">
            Patient Overview
          </h2>

          <p className="text-text-muted text-sm mt-1">
            Information currently available through the patient's
            authorized access.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

            {/* ACCESS */}
            <div className="bg-surface border border-gray-200 rounded-2xl p-5">

              <p className="text-text-muted text-sm">
                Access Status
              </p>

              <p className="text-green-700 font-semibold mt-2">
                Active
              </p>

            </div>

            {/* SUMMARY */}
            <div className="bg-surface border border-gray-200 rounded-2xl p-5">

              <p className="text-text-muted text-sm">
                Clinical Summary
              </p>

              <p className="text-text font-semibold mt-2">
                {hasClinicalSummary
                  ? "Available"
                  : "Not shared"}
              </p>

            </div>

            {/* REPORTS */}
            <div className="bg-surface border border-gray-200 rounded-2xl p-5">

              <p className="text-text-muted text-sm">
                Medical Reports
              </p>

              <p className="text-text font-semibold mt-2">
                {hasReports
                  ? "Available"
                  : "Not shared"}
              </p>

            </div>

          </div>

        </section>

        {/* WORKSPACE */}
        <section>

          <div className="mb-5">

            <h2 className="font-display text-xl font-semibold">
              Clinical Workspace
            </h2>

            <p className="text-text-muted text-sm mt-1">
              Select an action to review the patient's available
              information.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* CLINICAL SUMMARY */}
            <button
              onClick={() =>
                goToPage("/doctor/clinical-summary")
              }
              disabled={!hasClinicalSummary}
              className={`text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm transition ${
                hasClinicalSummary
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >

              <div className="text-3xl mb-4">
                🩺
              </div>

              <h3 className="font-semibold text-lg">
                Clinical Summary
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review the patient's presenting complaint,
                history, medications, allergies and family history.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review Summary →
              </p>

            </button>

            {/* MEDICAL REPORTS */}
            <button
              onClick={() =>
                goToPage("/doctor/patient-record")
              }
              disabled={!hasReports}
              className={`text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm transition ${
                hasReports
                  ? "hover:shadow-md hover:-translate-y-0.5"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >

              <div className="text-3xl mb-4">
                📄
              </div>

              <h3 className="font-semibold text-lg">
                Medical Reports
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review the patient's available medical records
                and reports.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                View Records →
              </p>

            </button>

            {/* ATTENTION */}
            <button
              onClick={() =>
                goToPage("/doctor/attention")
              }
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >

              <div className="text-3xl mb-4">
                ⚠️
              </div>

              <h3 className="font-semibold text-lg">
                What Needs Attention
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review incomplete information and important
                clinical attention items.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review Attention →
              </p>

            </button>

            {/* VERIFICATION */}
            <button
              onClick={() =>
                goToPage("/doctor/verification")
              }
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >

              <div className="text-3xl mb-4">
                ✅
              </div>

              <h3 className="font-semibold text-lg">
                Verify Clinical Draft
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review the AI-generated clinical draft before
                making it an official record.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Review & Verify →
              </p>

            </button>

            {/* AUDIT LOG */}
            <button
              onClick={() =>
                goToPage("/doctor/audit-log")
              }
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >

              <div className="text-3xl mb-4">
                🔐
              </div>

              <h3 className="font-semibold text-lg">
                Access & Security
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Review access activity associated with this
                patient's records.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                View Audit Log →
              </p>

            </button>

            {/* EMERGENCY ACCESS */}
            <button
              onClick={() =>
                goToPage("/doctor/emergency-access")
              }
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >

              <div className="text-3xl mb-4">
                🚨
              </div>

              <h3 className="font-semibold text-lg">
                Emergency Access
              </h3>

              <p className="text-text-muted text-sm mt-2 leading-6">
                Access emergency-related patient information
                when clinically required.
              </p>

              <p className="text-primary text-sm font-medium mt-5">
                Emergency Access →
              </p>

            </button>

          </div>

        </section>

        {/* PRIVACY */}
        <section className="mt-8 bg-surface border border-gray-200 rounded-2xl p-5">

          <div className="flex gap-3 items-start">

            <span className="text-lg">
              🔒
            </span>

            <div>

              <p className="text-sm font-semibold">
                Patient-controlled access
              </p>

              <p className="text-text-muted text-sm mt-1 leading-6">
                Only information included in the patient's
                authorized sharing permission should be accessed.
                AI-generated information remains a draft until
                professionally reviewed.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
