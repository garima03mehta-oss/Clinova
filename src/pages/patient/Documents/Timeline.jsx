import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Timeline() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = () => {
    try {
      let timelineData = [];

      // Check possible timeline storage locations
      const timelineKeys = [
        "healthTimeline",
        "medicalTimeline",
        "timeline",
        "timelineEvents",
        "clinovaTimeline",
      ];

      for (const key of timelineKeys) {
        const storedData = localStorage.getItem(key);

        if (!storedData) {
          continue;
        }

        try {
          const parsedData = JSON.parse(storedData);

          if (Array.isArray(parsedData)) {
            timelineData = parsedData;
            break;
          }

          if (
            parsedData &&
            Array.isArray(parsedData.events)
          ) {
            timelineData = parsedData.events;
            break;
          }
        } catch (error) {
          console.log(`Could not read ${key}`);
        }
      }

      // Check patient information if no separate timeline exists
      if (timelineData.length === 0) {
        const patientKeys = [
          "patient",
          "patientData",
          "clinovaPatient",
        ];

        for (const key of patientKeys) {
          const storedPatient = localStorage.getItem(key);

          if (!storedPatient) {
            continue;
          }

          try {
            const patient = JSON.parse(storedPatient);

            if (
              Array.isArray(patient?.timeline)
            ) {
              timelineData = patient.timeline;
              break;
            }

            if (
              Array.isArray(patient?.healthTimeline)
            ) {
              timelineData = patient.healthTimeline;
              break;
            }

            if (
              Array.isArray(patient?.medicalTimeline)
            ) {
              timelineData = patient.medicalTimeline;
              break;
            }
          } catch (error) {
            console.log("Could not read patient data");
          }
        }
      }

      // Normalize timeline records
      const formattedEvents = timelineData
        .filter(Boolean)
        .map((item, index) => {
          const rawType =
            item?.type ||
            item?.category ||
            item?.eventType ||
            "Medical Record";

          return {
            id:
              item?.id ||
              item?.eventId ||
              `timeline-${index}`,

            date:
              item?.date ||
              item?.eventDate ||
              item?.createdAt ||
              item?.timestamp ||
              "",

            title:
              item?.title ||
              item?.name ||
              item?.event ||
              "Medical Record",

            type: String(rawType),

            description:
              item?.description ||
              item?.summary ||
              item?.details ||
              "No additional information available.",

            source:
              item?.source ||
              "Patient Record",

            status:
              item?.status ||
              (item?.aiGenerated
                ? "DRAFT"
                : "ACTIVE"),
          };
        });

      // Newest records first
      formattedEvents.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (Number.isNaN(dateA)) return 1;
        if (Number.isNaN(dateB)) return -1;

        return dateB - dateA;
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error(
        "Health Timeline loading failed:",
        error
      );

      setEvents([]);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "Date not available";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(value);
    }
  };

  const getTypeLabel = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("consult")) {
      return "CONSULTATION";
    }

    if (
      value.includes("investigation") ||
      value.includes("test") ||
      value.includes("report") ||
      value.includes("document")
    ) {
      return "INVESTIGATION";
    }

    if (
      value.includes("prescription") ||
      value.includes("medication")
    ) {
      return "PRESCRIPTION";
    }

    if (value.includes("hospital")) {
      return "HOSPITALIZATION";
    }

    if (value.includes("diagnos")) {
      return "DIAGNOSIS";
    }

    if (value.includes("emergency")) {
      return "EMERGENCY";
    }

    if (value.includes("verification")) {
      return "VERIFICATION";
    }

    return String(type || "RECORD").toUpperCase();
  };

  const getStatusStyle = (status) => {
    const value = String(
      status || "ACTIVE"
    ).toUpperCase();

    if (value === "VERIFIED") {
      return "bg-green-50 text-green-700 border-green-300";
    }

    if (value === "DRAFT") {
      return "bg-violet-50 text-violet-700 border-violet-300";
    }

    if (value === "EMERGENCY") {
      return "bg-red-50 text-red-700 border-red-300";
    }

    if (value === "REVOKED") {
      return "bg-gray-100 text-gray-500 border-gray-300";
    }

    if (value === "PENDING") {
      return "bg-gray-50 text-gray-500 border-gray-300";
    }

    return "bg-primary-light text-primary border-primary";
  };

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* Top Header */}
      <header className="bg-surface border-b border-gray-200">

        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="font-mono text-xs tracking-widest text-primary">
                CLINOVA
              </p>

              <h1 className="font-display text-xl font-semibold text-text mt-1">
                Health Timeline
              </h1>

            </div>

            <span className="px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide">
              PATIENT RECORD
            </span>

          </div>

        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Page heading */}
        <section className="mb-8">

          <p className="font-mono text-xs tracking-widest text-primary mb-2">
            LONGITUDINAL HEALTH RECORD
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text">
            Your Health Timeline
          </h2>

          <p className="text-text-muted mt-3 max-w-2xl leading-6">
            A chronological view of your available medical
            records, investigations, consultations and other
            healthcare events.
          </p>

        </section>

        {/* Security / Trust Banner */}
        <section className="bg-primary-light border border-primary rounded-2xl p-5 mb-8">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              🔐
            </div>

            <div>

              <h3 className="font-display font-semibold text-primary">
                Trusted medical history
              </h3>

              <p className="text-primary text-sm mt-1 leading-6">
                Clinova displays available records rather than
                creating missing medical history. AI-generated
                information remains a draft until verified.
              </p>

            </div>

          </div>

        </section>

        {/* Timeline with records */}
        {events.length > 0 ? (

          <section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

              <div>

                <h3 className="font-display text-xl font-semibold text-text">
                  Medical Events
                </h3>

                <p className="text-sm text-text-muted mt-1">
                  {events.length}{" "}
                  {events.length === 1
                    ? "event"
                    : "events"}{" "}
                  recorded
                </p>

              </div>

              <span className="px-3 py-1 rounded-full border border-green-300 bg-green-50 text-green-700 text-xs font-mono tracking-wide">
                CHRONOLOGICAL
              </span>

            </div>

            {/* Timeline */}
            <div className="relative">

              {/* Vertical line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-300" />

              {events.map((event) => (

                <div
                  key={event.id}
                  className="relative pl-10 sm:pl-12 mb-6 last:mb-0"
                >

                  {/* Timeline dot */}
                  <div className="absolute left-0 top-5 w-6 h-6 rounded-full bg-primary-light border-2 border-primary flex items-center justify-center">

                    <div className="w-2 h-2 rounded-full bg-primary" />

                  </div>

                  {/* Card */}
                  <article className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-md transition">

                    {/* Date + status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <span className="font-mono text-xs tracking-wide text-primary">
                        {formatDate(event.date)}
                      </span>

                      <span
                        className={`inline-block w-fit px-3 py-1 rounded-full border text-xs font-mono tracking-wide ${getStatusStyle(
                          event.status
                        )}`}
                      >
                        {String(
                          event.status || "ACTIVE"
                        ).toUpperCase()}
                      </span>

                    </div>

                    {/* Event type */}
                    <div className="mt-4">

                      <span className="inline-block px-3 py-1 rounded-full bg-primary-light border border-primary text-primary text-xs font-mono tracking-wide">
                        {getTypeLabel(event.type)}
                      </span>

                    </div>

                    {/* Event title */}
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-text mt-4">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-text-muted leading-6 mt-2">
                      {event.description}
                    </p>

                    {/* Source */}
                    <div className="border-t border-gray-100 mt-5 pt-4">

                      <p className="font-mono text-xs text-text-muted">
                        SOURCE:{" "}
                        {String(
                          event.source ||
                            "PATIENT RECORD"
                        ).toUpperCase()}
                      </p>

                    </div>

                  </article>

                </div>

              ))}

            </div>

          </section>

        ) : (

          /* Empty State */
          <section className="bg-surface border border-dashed border-gray-300 rounded-2xl shadow-sm p-10 sm:p-16 text-center">

            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-light flex items-center justify-center text-4xl">
              📅
            </div>

            <div className="mt-5">

              <span className="inline-block px-3 py-1 rounded-full border border-gray-300 bg-gray-50 text-gray-500 text-xs font-mono tracking-wide">
                NO EVENTS
              </span>

            </div>

            <h3 className="font-display text-xl sm:text-2xl font-semibold text-text mt-5">
              No medical timeline events yet.
            </h3>

            <p className="text-text-muted max-w-lg mx-auto mt-3 leading-6">
              Your timeline will appear here when consultations,
              investigations, prescriptions, uploaded reports or
              other medical records are added to Clinova.
            </p>

            <p className="font-mono text-xs text-text-muted mt-5">
              NO SYNTHETIC HISTORY GENERATED
            </p>

          </section>

        )}

        {/* AI information */}
        <section className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-6 mt-8">

          <div className="flex items-start gap-3">

            <div className="text-xl">
              ✨
            </div>

            <div>

              <h3 className="font-display font-semibold text-text">
                AI information is clearly marked
              </h3>

              <p className="text-sm text-text-muted leading-6 mt-2">
                Information generated or extracted by AI is treated
                as a draft and must be reviewed by a healthcare
                professional before becoming an official clinical
                record.
              </p>

              <div className="mt-4">

                <span className="inline-block px-3 py-1 rounded-full border border-violet-300 bg-violet-50 text-violet-700 text-xs font-mono">
                  DRAFT
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

          <button
            type="button"
            onClick={() =>
              navigate("/health-record")
            }
            className="bg-surface border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
          >
            My Medical Record
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/search")
            }
            className="bg-surface border border-gray-300 text-text py-3 px-4 rounded-xl font-display hover:bg-gray-50 transition"
          >
            Search Records
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/patient/dashboard")
            }
            className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
          >
            Back to Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}