import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/config";
import { logAccessEvent } from "../../utils/auditLog";

export default function PatientQueue() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuthorizedPatients = async () => {
      const doctorId = auth.currentUser?.uid;

      if (!doctorId) {
        navigate("/doctor");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const q = query(
          collection(db, "accessRequests"),
          where("doctorId", "==", doctorId),
          where("status", "==", "ACTIVE")
        );

        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setPatients(results);

        await logAccessEvent({
          who: doctorId,
          what: "PATIENT_QUEUE_VIEWED",
          why: "Doctor opened authorized patient list",
          result: "ALLOWED",
        });
      } catch (err) {
        console.error("Patient queue error:", err);
        setError(
          "Unable to load authorized patients. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorizedPatients();
  }, [navigate]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not available";

    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleString();
      }

      return new Date(timestamp).toLocaleString();
    } catch {
      return "Not available";
    }
  };

  const openPatient = (patient, destination) => {
    localStorage.setItem(
      "clinovaSelectedPatient",
      JSON.stringify(patient)
    );

    navigate(destination, {
      state: {
        patient,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <p className="text-primary text-xs font-bold tracking-wide">
              CLINOVA • DOCTOR PORTAL
            </p>

            <h1 className="font-display text-2xl font-semibold text-text mt-1">
              Patient Requests
            </h1>
          </div>

          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-text hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-7">
          <h2 className="text-xl font-semibold text-text">
            Authorized Patients
          </h2>

          <p className="text-text-muted text-sm mt-1">
            Patients who have granted you active access to
            selected medical information.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="bg-surface border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-text-muted">
              Loading authorized patients...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && patients.length === 0 && (
          <div className="bg-surface border border-gray-200 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              👥
            </div>

            <h3 className="text-lg font-semibold text-text">
              No active patients
            </h3>

            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
              When a patient shares a secure access code with you
              and access is activated, the patient will appear here.
            </p>

            <button
              onClick={() => navigate("/doctor/enter-code")}
              className="mt-6 bg-primary text-white px-5 py-3 rounded-xl font-medium"
            >
              Enter Patient Access Code
            </button>

          </div>
        )}

        {/* PATIENT CARDS */}
        {!loading && patients.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {patients.map((patient) => {

              const patientName =
                patient.patientName ||
                patient.name ||
                "Patient";

              const patientId =
                patient.patientId ||
                "Not available";

              return (
                <div
                  key={patient.id}
                  className="bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm"
                >

                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        👤
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-text">
                          {patientName}
                        </h3>

                        <p className="text-xs text-text-muted mt-1">
                          Patient ID: {patientId}
                        </p>
                      </div>

                    </div>

                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-700">
                      Access Active
                    </span>

                  </div>

                  {/* ACCESS INFO */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-text-muted">
                        Access Granted
                      </p>

                      <p className="text-sm font-medium text-text mt-1">
                        {formatDate(patient.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-text-muted">
                        Access Expires
                      </p>

                      <p className="text-sm font-medium text-text mt-1">
                        {formatDate(patient.expiresAt)}
                      </p>
                    </div>

                  </div>

                  {/* SHARED INFORMATION */}
                  <div className="mt-5">

                    <p className="text-sm font-semibold text-text mb-3">
                      Shared Information
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {patient.scope?.clinicalSummary && (
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs text-text">
                          Clinical Summary
                        </span>
                      )}

                      {patient.scope?.timeline && (
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs text-text">
                          Medical Timeline
                        </span>
                      )}

                      {patient.scope?.reports && (
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs text-text">
                          Medical Reports
                        </span>
                      )}

                      {!patient.scope && (
                        <span className="text-xs text-text-muted">
                          Sharing details unavailable
                        </span>
                      )}

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">

                    <button
                      onClick={() =>
                        openPatient(
                          patient,
                          "/doctor/attention"
                        )
                      }
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium text-text hover:bg-gray-50"
                    >
                      🚨 Attention
                    </button>

                    <button
                      onClick={() =>
                        openPatient(
                          patient,
                          "/doctor/summary"
                        )
                      }
                      className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90"
                    >
                      View Clinical Summary
                    </button>

                  </div>

                  {/* WORKSPACE */}
                  <button
                    onClick={() =>
                      openPatient(
                        patient,
                        "/doctor/patient-workspace"
                      )
                    }
                    className="mt-3 w-full px-4 py-3 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5"
                  >
                    Open Patient Workspace →
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
}