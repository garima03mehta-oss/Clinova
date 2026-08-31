import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function DoctorPatient() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const accessRequest = location.state?.accessRequest || {};

  const patientName =
    accessRequest.patientName || "Patient";

  const scope =
    accessRequest.scope || {};

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* HEADER */}

      <header className="bg-surface border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => navigate("/doctor/queue")}
            className="text-primary text-sm mb-3"
          >
            ← Back to Patients
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-primary text-xs font-bold tracking-wide">
                CLINOVA • PATIENT RECORD
              </p>

              <h1 className="font-display text-2xl font-semibold text-text mt-1">
                {patientName}
              </h1>

              <p className="text-text-muted text-sm mt-1">
                Patient ID: {patientId}
              </p>

            </div>

            <span className="inline-flex w-fit bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              ✓ Access Active
            </span>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ACCESS NOTICE */}

        <div className="bg-surface border border-gray-100 rounded-2xl p-5 mb-7">

          <h2 className="font-semibold text-text">
            Shared Information
          </h2>

          <div className="flex flex-wrap gap-2 mt-3">

            {scope.clinicalSummary && (
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                Clinical Summary
              </span>
            )}

            {scope.timeline && (
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                Medical Timeline
              </span>
            )}

            {scope.reports && (
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                Medical Reports
              </span>
            )}

          </div>

        </div>

        {/* CLINICAL WORKSPACE */}

        <h2 className="font-display text-xl font-semibold text-text mb-4">
          Clinical Workspace
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* SUMMARY */}

          {scope.clinicalSummary && (
            <button
              onClick={() => navigate("/doctor/summary")}
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
            >
              <div className="text-3xl mb-4">
                🩺
              </div>

              <h3 className="text-lg font-semibold text-text">
                Clinical Summary
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review the patient's structured clinical history.
              </p>

              <span className="text-primary text-sm mt-4 inline-block">
                Review summary →
              </span>
            </button>
          )}

          {/* DOCUMENTS */}

          {scope.reports && (
            <button
              onClick={() =>
                navigate(`/doctor/patient/${patientId}/documents`, {
                  state: {
                    accessRequest,
                  },
                })
              }
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
            >
              <div className="text-3xl mb-4">
                📄
              </div>

              <h3 className="text-lg font-semibold text-text">
                Medical Documents
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review uploaded reports and extracted medical information.
              </p>

              <span className="text-primary text-sm mt-4 inline-block">
                View documents →
              </span>
            </button>
          )}

          {/* TIMELINE */}

          {scope.timeline && (
            <button
              onClick={() =>
                navigate("/doctor/attention")
              }
              className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
            >
              <div className="text-3xl mb-4">
                🕒
              </div>

              <h3 className="text-lg font-semibold text-text">
                Medical Timeline
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review important events and previous medical information.
              </p>

              <span className="text-primary text-sm mt-4 inline-block">
                View timeline →
              </span>
            </button>
          )}

          {/* ATTENTION */}

          <button
            onClick={() => navigate("/doctor/attention")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
          >
            <div className="text-3xl mb-4">
              ⚠️
            </div>

            <h3 className="text-lg font-semibold text-text">
              What Needs Attention?
            </h3>

            <p className="text-text-muted text-sm mt-2">
              Review incomplete information and important findings.
            </p>

            <span className="text-primary text-sm mt-4 inline-block">
              Review attention items →
            </span>
          </button>

          {/* VERIFICATION */}

          <button
            onClick={() => navigate("/doctor/verification")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
          >
            <div className="text-3xl mb-4">
              ✓
            </div>

            <h3 className="text-lg font-semibold text-text">
              Verify Clinical Record
            </h3>

            <p className="text-text-muted text-sm mt-2">
              Review AI-generated drafts before confirming them.
            </p>

            <span className="text-primary text-sm mt-4 inline-block">
              Review verification →
            </span>
          </button>

          {/* EMERGENCY */}

          <button
            onClick={() => navigate("/doctor/emergency")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md"
          >
            <div className="text-3xl mb-4">
              🚨
            </div>

            <h3 className="text-lg font-semibold text-text">
              Emergency Information
            </h3>

            <p className="text-text-muted text-sm mt-2">
              Access emergency information through the secure workflow.
            </p>

            <span className="text-primary text-sm mt-4 inline-block">
              Open emergency access →
            </span>
          </button>

        </div>

      </main>
    </div>
  );
}
