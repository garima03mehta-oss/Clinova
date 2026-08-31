import React from "react";
import { useNavigate } from "react-router-dom";

function DashboardCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  featured = false,
}) {
  return (
    <div
      className={
        featured
          ? "bg-white rounded-2xl border-2 border-primary shadow-sm p-6 hover:shadow-md transition"
          : "bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition"
      }
    >
      <div
        className={
          featured
            ? "w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl"
            : "w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl"
        }
      >
        {icon}
      </div>

      <h3 className="font-display text-lg font-semibold text-text mt-5">
        {title}
      </h3>

      <p className="text-sm text-text-muted leading-6 mt-2">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={
          featured
            ? "mt-5 w-full bg-primary text-white py-3 rounded-xl font-display hover:bg-primary-dark transition"
            : "mt-5 w-full bg-white border-2 border-primary text-primary py-3 rounded-xl font-display hover:bg-primary-light transition"
        }
      >
        {buttonText}
      </button>
    </div>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* ================================
          HEADER
      ================================= */}

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="font-mono text-xs tracking-widest text-primary">
                CLINOVA
              </p>

              <h1 className="font-display text-2xl font-semibold text-text mt-1">
                Doctor Portal
              </h1>

              <p className="text-sm text-text-muted mt-1">
                Secure pre-consultation workspace
              </p>

            </div>

            <div className="flex gap-2">

              <span className="px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono">
                DOCTOR
              </span>

              <span className="px-3 py-1 rounded-full border border-green-300 bg-green-50 text-green-700 text-xs font-mono">
                SECURE
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* ================================
          MAIN
      ================================= */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome */}

        <section className="mb-8">

          <p className="font-mono text-xs tracking-widest text-primary mb-2">
            CLINICAL WORKSPACE
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text">
            Welcome, Doctor
          </h2>

          <p className="text-text-muted max-w-2xl mt-3 leading-6">
            Review patient-approved information, pre-consultation
            summaries, clinical attention items and verification status
            from one secure workspace.
          </p>

        </section>


        {/* ================================
            SECURITY BANNER
        ================================= */}

        <section className="bg-primary-light border border-primary rounded-2xl p-5 mb-8">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              🔐
            </div>

            <div>

              <h3 className="font-display font-semibold text-primary">
                Patient-controlled access
              </h3>

              <p className="text-primary text-sm mt-1 leading-6">
                Patient information should only be accessed through
                valid permissions. Access activity should remain
                time-limited and auditable.
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            PATIENT REQUESTS
        ================================= */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="font-mono text-xs tracking-widest text-primary">
              PATIENT ACCESS
            </p>

            <h2 className="font-display text-xl font-semibold text-text mt-1">
              Patient Requests
            </h2>

            <p className="text-sm text-text-muted mt-1">
              Access patient records after receiving valid patient
              authorization.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <DashboardCard
              icon="👥"
              title="Patient Queue"
              description="View patients who have granted you access to their available medical information."
              buttonText="View Patients"
              featured={true}
              onClick={() => navigate("/doctor/queue")}
            />


            <DashboardCard
              icon="🔑"
              title="Enter Patient Code"
              description="Enter a secure access code shared by a patient to access their authorized clinical information."
              buttonText="Enter Access Code"
              onClick={() => navigate("/doctor/enter-code")}
            />

          </div>

        </section>


        {/* ================================
            CLINICAL TOOLS
        ================================= */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="font-mono text-xs tracking-widest text-primary">
              CLINICAL TOOLS
            </p>

            <h2 className="font-display text-xl font-semibold text-text mt-1">
              Clinical Review
            </h2>

            <p className="text-sm text-text-muted mt-1">
              Review information from the currently selected patient.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <DashboardCard
              icon="🚨"
              title="Attention Layer"
              description="Review important clinical attention items from the selected patient."
              buttonText="Open Attention"
              onClick={() => navigate("/doctor/attention")}
            />


            <DashboardCard
              icon="📄"
              title="Clinical Summary"
              description="Review the patient's structured pre-consultation information."
              buttonText="View Summary"
              onClick={() => navigate("/doctor/summary")}
            />


            <DashboardCard
              icon="✓"
              title="Verify Records"
              description="Review AI-generated drafts before confirming clinical information."
              buttonText="Verify Records"
              onClick={() => navigate("/doctor/verification")}
            />


            <DashboardCard
              icon="🚑"
              title="Emergency Access"
              description="Open the emergency workflow only when appropriate."
              buttonText="Emergency Access"
              onClick={() => navigate("/doctor/emergency")}
            />

          </div>

        </section>


        {/* ================================
            SECURITY AND ACTIVITY
        ================================= */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="font-mono text-xs tracking-widest text-primary">
              SECURITY AND ACTIVITY
            </p>

            <h2 className="font-display text-xl font-semibold text-text mt-1">
              Access Transparency
            </h2>

            <p className="text-sm text-text-muted mt-1">
              Review recorded access and verification activity.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <DashboardCard
              icon="🛡️"
              title="Audit Log"
              description="Review recorded patient access, verification and security events."
              buttonText="Open Audit Log"
              onClick={() => navigate("/doctor/audit-log")}
            />


            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl">
                🔐
              </div>

              <h3 className="font-display text-lg font-semibold text-text mt-5">
                Patient Consent Protected
              </h3>

              <p className="text-sm text-text-muted leading-6 mt-2">
                Clinova is designed around patient-controlled information
                sharing. Only information permitted by the access scope
                should be displayed.
              </p>

              <div className="mt-5">

                <span className="inline-block px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide">
                  CONSENT REQUIRED
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            WORKFLOW
        ================================= */}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <p className="font-mono text-xs tracking-widest text-primary">
            CLINOVA WORKFLOW
          </p>

          <h2 className="font-display text-xl font-semibold text-text mt-2">
            Doctor Consultation Flow
          </h2>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">

            <div className="bg-gray-50 rounded-xl p-4">

              <p className="font-mono text-xs text-primary">
                01
              </p>

              <p className="font-display text-sm font-semibold text-text mt-2">
                Access
              </p>

              <p className="text-xs text-text-muted mt-1">
                Patient grants access
              </p>

            </div>


            <div className="bg-gray-50 rounded-xl p-4">

              <p className="font-mono text-xs text-primary">
                02
              </p>

              <p className="font-display text-sm font-semibold text-text mt-2">
                Queue
              </p>

              <p className="text-xs text-text-muted mt-1">
                Select patient
              </p>

            </div>


            <div className="bg-gray-50 rounded-xl p-4">

              <p className="font-mono text-xs text-primary">
                03
              </p>

              <p className="font-display text-sm font-semibold text-text mt-2">
                Attention
              </p>

              <p className="text-xs text-text-muted mt-1">
                Review important items
              </p>

            </div>


            <div className="bg-gray-50 rounded-xl p-4">

              <p className="font-mono text-xs text-primary">
                04
              </p>

              <p className="font-display text-sm font-semibold text-text mt-2">
                Summary
              </p>

              <p className="text-xs text-text-muted mt-1">
                Review clinical information
              </p>

            </div>


            <div className="bg-primary-light rounded-xl p-4 border border-primary">

              <p className="font-mono text-xs text-primary">
                05
              </p>

              <p className="font-display text-sm font-semibold text-primary mt-2">
                Verification
              </p>

              <p className="text-xs text-primary mt-1">
                Confirm clinical record
              </p>

            </div>

          </div>

        </section>


        {/* ================================
            BOTTOM ACTIONS
        ================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">

          <button
            type="button"
            onClick={() => navigate("/doctor/enter-code")}
            className="bg-white border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
          >
            Enter Patient Access Code
          </button>


          <button
            type="button"
            onClick={() => navigate("/doctor/audit-log")}
            className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
          >
            View Audit Log
          </button>

        </div>

      </main>

    </div>
  );
}