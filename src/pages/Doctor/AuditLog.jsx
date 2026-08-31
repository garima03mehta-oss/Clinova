import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuditLog() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = () => {
    try {
      const possibleKeys = [
        "auditLogs",
        "auditLog",
        "clinovaAuditLogs",
      ];

      let storedLogs = [];

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
          continue;
        }

        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            storedLogs = parsed;
            break;
          }

          if (
            parsed &&
            Array.isArray(parsed.logs)
          ) {
            storedLogs = parsed.logs;
            break;
          }
        } catch {
          console.log(
            `Unable to read ${key}`
          );
        }
      }

      const formattedLogs = storedLogs
        .filter(Boolean)
        .map((log, index) => ({
          id:
            log?.id ||
            log?.logId ||
            `audit-${index}`,

          action:
            log?.action ||
            log?.event ||
            log?.activity ||
            "System Activity",

          description:
            log?.description ||
            log?.details ||
            log?.message ||
            "No additional information available.",

          actor:
            log?.actor ||
            log?.doctorName ||
            log?.user ||
            "System",

          actorId:
            log?.actorId ||
            log?.doctorId ||
            "",

          patientId:
            log?.patientId ||
            log?.clinovaPatientId ||
            "",

          timestamp:
            log?.timestamp ||
            log?.createdAt ||
            log?.date ||
            "",

          status:
            log?.status ||
            "RECORDED",

          accessCode:
            log?.accessCode ||
            "",

          scope:
            log?.scope ||
            "",
        }))
        .sort((a, b) => {
          const dateA = a.timestamp
            ? new Date(a.timestamp).getTime()
            : 0;

          const dateB = b.timestamp
            ? new Date(b.timestamp).getTime()
            : 0;

          return dateB - dateA;
        });

      setLogs(formattedLogs);
    } catch (error) {
      console.error(
        "Unable to load audit logs:",
        error
      );

      setLogs([]);
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Time not available";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) {
      return true;
    }

    const searchableText = [
      log.action,
      log.description,
      log.actor,
      log.actorId,
      log.patientId,
      log.status,
      log.scope,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const getStatusStyle = (status) => {
    const value = String(
      status || "RECORDED"
    ).toUpperCase();

    if (
      value === "VERIFIED" ||
      value === "ACCEPTED" ||
      value === "SUCCESS"
    ) {
      return "bg-green-50 text-green-700 border-green-300";
    }

    if (
      value === "REVOKED" ||
      value === "DENIED" ||
      value === "FAILED"
    ) {
      return "bg-red-50 text-red-700 border-red-300";
    }

    if (
      value === "PENDING" ||
      value === "DRAFT"
    ) {
      return "bg-orange-50 text-orange-700 border-orange-300";
    }

    return "bg-primary-light text-primary border-primary";
  };

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* Header */}
      <header className="bg-surface border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="font-mono text-xs tracking-widest text-primary">
                CLINOVA DOCTOR PORTAL
              </p>

              <h1 className="font-display text-xl sm:text-2xl font-semibold text-text mt-1">
                Audit Log
              </h1>

            </div>

            <span className="px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide w-fit">
              SECURITY LOG
            </span>

          </div>

        </div>

      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Introduction */}
        <section className="mb-8">

          <p className="font-mono text-xs tracking-widest text-primary mb-2">
            ACCESS TRANSPARENCY
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text">
            Activity & Access History
          </h2>

          <p className="text-text-muted mt-3 max-w-2xl leading-6">
            Review recorded activity related to patient access,
            record sharing, verification and other security events
            within Clinova.
          </p>

        </section>

        {/* Security Banner */}
        <section className="bg-primary-light border border-primary rounded-2xl p-5 mb-8">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              🛡️
            </div>

            <div>

              <h3 className="font-display font-semibold text-primary">
                Auditable patient access
              </h3>

              <p className="text-primary text-sm mt-1 leading-6">
                Clinova records important access and verification
                activity so that patient data movement remains
                transparent and accountable.
              </p>

            </div>

          </div>

        </section>

        {/* Search */}
        <section className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 mb-8">

          <label
            htmlFor="audit-search"
            className="font-display text-sm font-semibold text-text"
          >
            Search activity
          </label>

          <div className="relative mt-3">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </span>

            <input
              id="audit-search"
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search actions, patients, doctors or status..."
              className="w-full border border-gray-300 rounded-xl bg-white pl-12 pr-4 py-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />

          </div>

          {searchTerm && (
            <div className="flex items-center justify-between mt-3">

              <p className="text-xs text-text-muted">
                Searching for{" "}
                <span className="font-medium text-text">
                  "{searchTerm}"
                </span>
              </p>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs text-primary font-medium hover:underline"
              >
                Clear
              </button>

            </div>
          )}

        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5">

            <p className="font-mono text-xs text-text-muted tracking-wider">
              TOTAL EVENTS
            </p>

            <p className="font-display text-3xl font-semibold text-text mt-2">
              {logs.length}
            </p>

            <p className="text-xs text-text-muted mt-1">
              Recorded activities
            </p>

          </div>

          <div className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5">

            <p className="font-mono text-xs text-text-muted tracking-wider">
              VISIBLE EVENTS
            </p>

            <p className="font-display text-3xl font-semibold text-primary mt-2">
              {filteredLogs.length}
            </p>

            <p className="text-xs text-text-muted mt-1">
              Matching current search
            </p>

          </div>

          <div className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5">

            <p className="font-mono text-xs text-text-muted tracking-wider">
              LOG STATUS
            </p>

            <div className="mt-3">

              <span className="inline-block px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide">
                AUDIT ENABLED
              </span>

            </div>

          </div>

        </section>

        {/* Logs */}
        <section>

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="font-display text-xl font-semibold text-text">
                Recorded Activity
              </h3>

              <p className="text-sm text-text-muted mt-1">
                Security and patient-access events
              </p>

            </div>

          </div>

          {filteredLogs.length > 0 ? (

            <div className="space-y-4">

              {filteredLogs.map((log) => (

                <article
                  key={log.id}
                  className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-md transition"
                >

                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div>

                      <p className="font-mono text-xs text-primary tracking-wide">
                        {formatDateTime(log.timestamp)}
                      </p>

                      <h4 className="font-display text-lg font-semibold text-text mt-2">
                        {log.action}
                      </h4>

                    </div>

                    <span
                      className={`w-fit px-3 py-1 rounded-full border text-xs font-mono tracking-wide ${getStatusStyle(
                        log.status
                      )}`}
                    >
                      {String(
                        log.status || "RECORDED"
                      ).toUpperCase()}
                    </span>

                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-muted leading-6 mt-4">
                    {log.description}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">

                    <div>

                      <p className="font-mono text-[10px] tracking-wider text-text-muted">
                        ACTOR
                      </p>

                      <p className="text-sm text-text mt-1">
                        {log.actor || "Not available"}
                      </p>

                    </div>

                    <div>

                      <p className="font-mono text-[10px] tracking-wider text-text-muted">
                        PATIENT ID
                      </p>

                      <p className="font-mono text-xs text-text mt-1">
                        {log.patientId ||
                          "Not available"}
                      </p>

                    </div>

                    <div>

                      <p className="font-mono text-[10px] tracking-wider text-text-muted">
                        SCOPE
                      </p>

                      <p className="text-sm text-text mt-1">
                        {log.scope ||
                          "Not specified"}
                      </p>

                    </div>

                  </div>

                  {/* Access information */}
                  {(log.actorId ||
                    log.accessCode) && (

                    <div className="mt-4 flex flex-wrap gap-2">

                      {log.actorId && (
                        <span className="px-3 py-1 rounded-full border border-gray-300 bg-gray-50 text-gray-600 text-xs font-mono">
                          ACTOR: {log.actorId}
                        </span>
                      )}

                      {log.accessCode && (
                        <span className="px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono">
                          ACCESS: {log.accessCode}
                        </span>
                      )}

                    </div>

                  )}

                  {/* Log ID */}
                  <div className="mt-5 pt-4 border-t border-gray-100">

                    <p className="font-mono text-[10px] text-text-muted break-all">
                      LOG ID: {log.id}
                    </p>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* Empty state */
            <section className="bg-surface border border-dashed border-gray-300 rounded-2xl shadow-sm p-10 sm:p-14 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center text-3xl">
                🛡️
              </div>

              <h3 className="font-display text-xl font-semibold text-text mt-5">
                {searchTerm
                  ? "No matching audit events."
                  : "No audit events recorded yet."}
              </h3>

              <p className="text-text-muted max-w-md mx-auto mt-3 leading-6">
                {searchTerm
                  ? "Try searching for a different action, patient ID, actor or status."
                  : "Patient access and security activity will appear here when recorded."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-display hover:bg-primary-dark transition"
                >
                  Show All Events
                </button>
              )}

            </section>

          )}

        </section>

        {/* Audit explanation */}
        <section className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-6 mt-8">

          <div className="flex items-start gap-3">

            <div className="text-xl">
              🔐
            </div>

            <div>

              <h3 className="font-display font-semibold text-text">
                Why the audit log matters
              </h3>

              <p className="text-sm text-text-muted leading-6 mt-2">
                Clinova uses an auditable access model. Patient
                information should only be accessed according to
                the permission granted by the patient, and important
                access and verification actions should be recorded.
              </p>

            </div>

          </div>

        </section>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">

          <button
            type="button"
            onClick={() =>
              navigate("/doctor/dashboard")
            }
            className="bg-surface border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
          >
            Doctor Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/patient/dashboard")
            }
            className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
          >
            Patient Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}