import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function DoctorPatientRecord() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        if (!auth.currentUser) {
          navigate("/doctor");
          return;
        }

        /*
         * First use the patient information stored when
         * the doctor accepted the patient's access code.
         */
        const storedPatient =
          localStorage.getItem("clinovaSelectedPatient");

        if (storedPatient) {
          const parsed = JSON.parse(storedPatient);

          if (
            String(parsed.patientId) === String(patientId)
          ) {
            setPatient(parsed);
          }
        }

        /*
         * Try to load the patient profile from Firestore.
         */
        if (patientId) {
          const patientSnap = await getDoc(
            doc(db, "patients", patientId)
          );

          if (patientSnap.exists()) {
            setPatient((previous) => ({
              ...(previous || {}),
              ...patientSnap.data(),
              patientId,
            }));
          }
        }
      } catch (error) {
        console.error(
          "Patient record error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [navigate, patientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted">
          Loading patient record...
        </p>
      </div>
    );
  }

  const patientName =
    patient?.patientName ||
    patient?.name ||
    "Patient";

  return (
    <div className="min-h-screen bg-bg font-body px-6 py-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <button
              onClick={() => navigate("/doctor/queue")}
              className="text-primary text-sm font-medium mb-3"
            >
              ← Back to My Patients
            </button>

            <p className="text-primary text-sm font-semibold">
              PATIENT RECORD
            </p>

            <h1 className="font-display text-3xl font-semibold text-text mt-1">
              {patientName}
            </h1>

            <p className="text-text-muted text-sm mt-2">
              Patient ID: {patientId}
            </p>
          </div>

          <span className="inline-flex w-fit px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
            ACCESS ACTIVE
          </span>

        </div>

        {/* PATIENT OVERVIEW */}
        <div className="bg-surface border border-gray-100 rounded-2xl p-6 mb-6">

          <h2 className="font-display text-xl font-semibold text-text mb-5">
            Patient Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-bg rounded-xl p-4">
              <p className="text-xs text-text-muted">
                Patient Name
              </p>
              <p className="font-medium text-text mt-1">
                {patientName}
              </p>
            </div>

            <div className="bg-bg rounded-xl p-4">
              <p className="text-xs text-text-muted">
                Patient ID
              </p>
              <p className="font-medium text-text mt-1">
                {patientId}
              </p>
            </div>

            <div className="bg-bg rounded-xl p-4">
              <p className="text-xs text-text-muted">
                Access
              </p>
              <p className="font-medium text-green-700 mt-1">
                Active
              </p>
            </div>

          </div>

        </div>

        {/* WORKSPACE */}
        <h2 className="font-display text-xl font-semibold text-text mb-4">
          Medical Workspace
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          <button
            onClick={() => navigate("/doctor/summary")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">
              🩺
            </div>

            <h3 className="font-semibold text-text text-lg">
              Clinical Summary
            </h3>

            <p className="text-sm text-text-muted mt-2">
              Review the patient's structured clinical information.
            </p>
          </button>

          <button
            onClick={() => navigate("/doctor/attention")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">
              ⚠️
            </div>

            <h3 className="font-semibold text-text text-lg">
              What Needs Attention
            </h3>

            <p className="text-sm text-text-muted mt-2">
              Review important alerts and incomplete information.
            </p>
          </button>

          <button
            onClick={() => navigate("/timeline")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">
              🕒
            </div>

            <h3 className="font-semibold text-text text-lg">
              Medical Timeline
            </h3>

            <p className="text-sm text-text-muted mt-2">
              Review the patient's chronological medical history.
            </p>
          </button>

          <button
            onClick={() => navigate("/doctor/verification")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">
              ✓
            </div>

            <h3 className="font-semibold text-text text-lg">
              Verify AI Records
            </h3>

            <p className="text-sm text-text-muted mt-2">
              Review AI-generated drafts before verification.
            </p>
          </button>

          <button
            onClick={() => navigate("/doctor/emergency")}
            className="text-left bg-surface border border-gray-100 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">
              🚨
            </div>

            <h3 className="font-semibold text-text text-lg">
              Emergency Information
            </h3>

            <p className="text-sm text-text-muted mt-2">
              Open the emergency access workflow.
            </p>
          </button>

        </div>

        {/* IMPORTANT NOTICE */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">

          <h3 className="font-semibold text-text">
            AI-generated information
          </h3>

          <p className="text-sm text-text-muted mt-2 leading-6">
            AI-generated summaries and extracted information are drafts
            and should be verified against the original medical documents
            by a qualified healthcare professional.
          </p>

        </div>

      </div>
    </div>
  );
}
