import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../firebase/config";
import StatusBadge from "../../components/StatusBadge";
import { logAccessEvent } from "../../utils/auditLog";

export default function DoctorVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState("");

  let patient = location.state?.patient || null;

  // Fallback for page refresh
  if (!patient) {
    try {
      const storedPatient = localStorage.getItem(
        "clinovaSelectedPatient"
      );

      if (storedPatient) {
        patient = JSON.parse(storedPatient);
      }
    } catch (err) {
      console.error("Unable to load patient:", err);
    }
  }

  const patientName =
    patient?.patientName ||
    patient?.name ||
    "Patient";

  const patientId =
    patient?.patientId ||
    "Not available";

  const handleVerify = async () => {
    try {
      setError("");

      const doctorId = auth.currentUser?.uid;

      await logAccessEvent({
        who: doctorId || "unknown-doctor",
        what: "RECORD_VERIFIED",
        why: "Doctor confirmed AI-generated clinical draft",
        result: "ALLOWED",
        patientId: patientId,
      });

      setStatus("VERIFIED");
    } catch (err) {
      console.error("Verification failed:", err);
      setError(
        "Unable to save the verification. Please try again."
      );
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-bg font-body flex items-center justify-center px-6">
        <div className="bg-surface border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">

          <div className="text-5xl mb-4">
            👤
          </div>

          <h1 className="text-xl font-semibold text-text">
            Patient Not Selected
          </h1>

          <p className="text-sm text-text-muted mt-2 leading-6">
            No patient information was found. Please return to
            Patient Requests and select a patient again.
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
      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-primary text-xs font-bold tracking-wider">
                CLINOVA • DOCTOR PORTAL
              </p>

              <h1 className="font-display text-2xl font-semibold mt-1">
                Official Record Review
              </h1>

              <p className="text-sm text-text-muted mt-1">
                Final physician verification
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/doctor/clinical-summary", {
                  state: { patient },
                })
              }
              className="w-fit px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
            >
              ← Clinical Summary
            </button>

          </div>

        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* PATIENT CARD */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">
                Patient
              </p>

              <h2 className="text-xl font-semibold mt-1">
                {patientName}
              </h2>

              <p className="text-sm text-text-muted mt-1">
                Patient ID: {patientId}
              </p>
            </div>

          </div>

        </section>

        {/* VERIFICATION CARD */}
        <section className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                ✓
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  Clinical Record Verification
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  Confirm that the available information has been
                  reviewed by the physician.
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            {/* STATUS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-gray-50 border border-gray-200">

              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">
                  Current Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={status}
                    label={
                      status === "DRAFT"
                        ? "AI-Generated Clinical Draft"
                        : "Official Clinical Record"
                    }
                  />
                </div>
              </div>

              {status === "VERIFIED" && (
                <span className="text-sm font-medium text-success">
                  ✓ Verified successfully
                </span>
              )}

            </div>

            {/* WARNING */}
            {status === "DRAFT" && (
              <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-5">

                <div className="flex gap-3 items-start">

                  <span className="text-lg">
                    ⚠️
                  </span>

                  <div>
                    <h3 className="font-semibold text-orange-900">
                      Physician Confirmation Required
                    </h3>

                    <p className="text-sm text-orange-800 mt-1 leading-6">
                      Confirm only after reviewing the patient's
                      clinical summary and available medical reports.
                      AI-generated information should be treated as
                      a draft until reviewed.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* SUCCESS */}
            {status === "VERIFIED" && (
              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">

                <div className="flex gap-3 items-start">

                  <span className="text-lg">
                    ✓
                  </span>

                  <div>
                    <h3 className="font-semibold text-green-800">
                      Record Verified
                    </h3>

                    <p className="text-sm text-green-700 mt-1 leading-6">
                      The clinical draft has been marked as reviewed
                      and verified by the doctor.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                onClick={() =>
                  navigate("/doctor/clinical-summary", {
                    state: { patient },
                  })
                }
                className="flex-1 border border-gray-300 text-text py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Review Summary Again
              </button>

              {status === "DRAFT" && (
                <button
                  onClick={handleVerify}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  ✓ Verify & Make Official
                </button>
              )}

              {status === "VERIFIED" && (
                <button
                  onClick={() => navigate("/doctor/queue")}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  ← Back to Patient Requests
                </button>
              )}

            </div>

          </div>

        </section>

        {/* PRIVACY NOTE */}
        <div className="mt-6 flex gap-3 items-start px-1">

          <span className="text-lg">
            🔒
          </span>

          <p className="text-xs text-text-muted leading-5">
            Verification records are logged for audit purposes.
            Patient information is handled within the authorized
            clinical session.
          </p>

        </div>

      </main>

    </div>
  );
}