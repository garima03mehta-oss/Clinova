import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [activePatients, setActivePatients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const currentDoctor = auth.currentUser;

      if (!currentDoctor) {
        navigate("/doctor");
        return;
      }

      try {
        const storedDoctor = localStorage.getItem("clinovaDoctor");

        if (storedDoctor) {
          setDoctor(JSON.parse(storedDoctor));
        }

        const q = query(
          collection(db, "accessRequests"),
          where("doctorId", "==", currentDoctor.uid),
          where("status", "==", "ACTIVE")
        );

        const snapshot = await getDocs(q);

        setActivePatients(snapshot.size);
      } catch (error) {
        console.error("Doctor dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();

      localStorage.removeItem("clinovaDoctor");
      localStorage.removeItem("clinovaDoctorId");

      navigate("/doctor");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const doctorEmail =
    doctor?.email ||
    auth.currentUser?.email ||
    "Doctor";

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <p className="text-primary text-sm font-semibold">
              CLINOVA • DOCTOR PORTAL
            </p>

            <h1 className="font-display text-2xl font-semibold text-text mt-1">
              Doctor Dashboard
            </h1>
          </div>

         <button
           onClick={() => navigate("/doctor/billing")}
           className="text-left bg-surface border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
          >
          <div className="text-3xl mb-4">
            💰
          </div>

          <h3 className="font-semibold text-text text-lg">
            Billing & Expenses
          </h3>

          <p className="text-text-muted text-sm mt-2">
            Create patient bills, track payments, and manage treatment expenses.
          </p>

          <p className="text-primary text-sm font-medium mt-5">
            Open Billing →
          </p>
         </button>

        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* WELCOME */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text">
            Welcome back, Doctor 👋
          </h2>

          <p className="text-text-muted mt-1">
            {doctorEmail}
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-surface rounded-2xl border border-gray-200 p-6">
            <p className="text-text-muted text-sm">
              Active Patients
            </p>

            <p className="text-3xl font-semibold text-text mt-2">
              {loading ? "—" : activePatients}
            </p>

            <p className="text-xs text-text-muted mt-2">
              Patients who granted active access
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-gray-200 p-6">
            <p className="text-text-muted text-sm">
              Clinical Review
            </p>

            <p className="text-3xl font-semibold text-text mt-2">
              AI
            </p>

            <p className="text-xs text-text-muted mt-2">
              Review AI-generated clinical drafts
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-gray-200 p-6">
            <p className="text-text-muted text-sm">
              Security
            </p>

            <p className="text-3xl font-semibold text-text mt-2">
              Protected
            </p>

            <p className="text-xs text-text-muted mt-2">
              Access is controlled by patient consent
            </p>
          </div>

        </div>

        {/* PATIENT MANAGEMENT */}
        <section className="mb-8">

          <h2 className="text-lg font-semibold text-text mb-4">
            Patient Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <button
              onClick={() => navigate("/doctor/queue")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">👥</div>

              <h3 className="font-semibold text-text text-lg">
                Patient Requests
              </h3>

              <p className="text-text-muted text-sm mt-2">
                View patients who have granted you access to
                their medical information.
              </p>

              <span className="inline-block mt-4 text-primary text-sm font-medium">
                View Patients →
              </span>
            </button>

            <button
              onClick={() => navigate("/doctor/enter-code")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">🔐</div>

              <h3 className="font-semibold text-text text-lg">
                Enter Patient Code
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Enter a secure access code shared by a patient.
              </p>

              <span className="inline-block mt-4 text-primary text-sm font-medium">
                Enter Code →
              </span>
            </button>

          </div>

        </section>

        {/* CLINICAL TOOLS */}
        <section className="mb-8">

          <h2 className="text-lg font-semibold text-text mb-4">
            Clinical Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <button
              onClick={() => navigate("/doctor/attention")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="text-2xl mb-3">🚨</div>

              <h3 className="font-semibold text-text">
                Attention Layer
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review important clinical attention items.
              </p>
            </button>

            <button
              onClick={() => navigate("/doctor/summary")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="text-2xl mb-3">📝</div>

              <h3 className="font-semibold text-text">
                Clinical Summary
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review the patient's clinical summary.
              </p>
            </button>

            <button
              onClick={() => navigate("/doctor/verification")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="text-2xl mb-3">✓</div>

              <h3 className="font-semibold text-text">
                Verify Records
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review AI drafts before making them official.
              </p>
            </button>

            <button
              onClick={() => navigate("/doctor/emergency")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="text-2xl mb-3">🚑</div>

              <h3 className="font-semibold text-text">
                Emergency Access
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Access emergency workflow with proper controls.
              </p>
            </button>

          </div>

        </section>

        {/* SECURITY */}
        <section>

          <h2 className="text-lg font-semibold text-text mb-4">
            Security & Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <button
              onClick={() => navigate("/doctor/audit-log")}
              className="text-left bg-surface border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">🛡️</div>

              <h3 className="font-semibold text-text text-lg">
                Audit Log
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Review access and security activity associated
                with doctor actions.
              </p>

              <span className="inline-block mt-4 text-primary text-sm font-medium">
                View Audit Log →
              </span>
            </button>

            <div className="bg-surface border border-gray-200 rounded-2xl p-6">

              <div className="text-3xl mb-3">
                🔒
              </div>

              <h3 className="font-semibold text-text text-lg">
                Patient Consent Protected
              </h3>

              <p className="text-text-muted text-sm mt-2">
                Clinova only displays patient information through
                authorized access sessions.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
