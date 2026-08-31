import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecordSearch() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    try {
      let allRecords = [];

      /*
       * Load documents from localStorage.
       */
      const documentKeys = [
        "documents",
        "medicalDocuments",
        "patientDocuments",
        "clinovaDocuments",
      ];

      for (const key of documentKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
          continue;
        }

        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            allRecords = [
              ...allRecords,
              ...parsed,
            ];
          }
        } catch {
          console.log(`Unable to read ${key}`);
        }
      }

      /*
       * Load timeline records.
       */
      const timelineKeys = [
        "healthTimeline",
        "medicalTimeline",
        "timeline",
        "timelineEvents",
        "clinovaTimeline",
      ];

      for (const key of timelineKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
          continue;
        }

        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            allRecords = [
              ...allRecords,
              ...parsed,
            ];
          }

          if (
            parsed &&
            Array.isArray(parsed.events)
          ) {
            allRecords = [
              ...allRecords,
              ...parsed.events,
            ];
          }
        } catch {
          console.log(`Unable to read ${key}`);
        }
      }

      /*
       * Load patient data.
       */
      const patientKeys = [
        "patient",
        "patientData",
        "clinovaPatient",
      ];

      for (const key of patientKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
          continue;
        }

        try {
          const patient = JSON.parse(stored);

          if (
            patient &&
            Array.isArray(patient.documents)
          ) {
            allRecords = [
              ...allRecords,
              ...patient.documents,
            ];
          }

          if (
            patient &&
            Array.isArray(patient.timeline)
          ) {
            allRecords = [
              ...allRecords,
              ...patient.timeline,
            ];
          }

          if (
            patient &&
            Array.isArray(patient.medicalHistory)
          ) {
            allRecords = [
              ...allRecords,
              ...patient.medicalHistory,
            ];
          }
        } catch {
          console.log(
            "Unable to read patient information"
          );
        }
      }

      /*
       * Remove duplicate records.
       */
      const uniqueRecords = [];
      const seen = new Set();

      allRecords.forEach((record, index) => {
        if (!record) {
          return;
        }

        const uniqueKey =
          record.id ||
          record.documentId ||
          record.eventId ||
          `${record.name || record.title || "record"}-${index}`;

        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueRecords.push({
            ...record,
            _recordId: uniqueKey,
          });
        }
      });

      setRecords(uniqueRecords);
    } catch (error) {
      console.error(
        "Unable to load medical records:",
        error
      );

      setRecords([]);
    }
  };

  /*
   * Search actual records.
   */
  const filteredRecords = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) => {
      const searchableText = [
        record?.name,
        record?.title,
        record?.documentName,
        record?.documentType,
        record?.type,
        record?.category,
        record?.description,
        record?.summary,
        record?.details,
        record?.hospital,
        record?.hospitalName,
        record?.doctor,
        record?.doctorName,
        record?.date,
        record?.documentDate,
        record?.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [records, searchTerm]);

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

  const getRecordTitle = (record) => {
    return (
      record?.name ||
      record?.documentName ||
      record?.title ||
      record?.event ||
      "Medical Record"
    );
  };

  const getRecordType = (record) => {
    const value =
      record?.documentType ||
      record?.type ||
      record?.category ||
      "RECORD";

    return String(value).toUpperCase();
  };

  const getRecordDescription = (record) => {
    return (
      record?.description ||
      record?.summary ||
      record?.details ||
      "No additional information available."
    );
  };

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* Header */}
      <header className="bg-surface border-b border-gray-200">

        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="font-mono text-xs tracking-widest text-primary">
                CLINOVA
              </p>

              <h1 className="font-display text-xl font-semibold text-text mt-1">
                Record Search
              </h1>

            </div>

            <span className="px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide">
              SECURE SEARCH
            </span>

          </div>

        </div>

      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Page heading */}
        <section className="mb-8">

          <p className="font-mono text-xs tracking-widest text-primary mb-2">
            MEDICAL RECORDS
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text">
            Search Your Records
          </h2>

          <p className="text-text-muted mt-3 max-w-2xl leading-6">
            Search your available medical documents and health
            records using keywords such as report name, hospital,
            doctor, investigation or record type.
          </p>

        </section>

        {/* Search box */}
        <section className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">

          <label
            htmlFor="record-search"
            className="font-display text-sm font-semibold text-text"
          >
            Search medical records
          </label>

          <div className="relative mt-3">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </span>

            <input
              id="record-search"
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search reports, tests, hospitals, doctors..."
              className="w-full border border-gray-300 bg-white rounded-xl pl-12 pr-4 py-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />

          </div>

          {searchTerm && (
            <div className="flex items-center justify-between mt-3">

              <p className="text-xs text-text-muted">
                Searching for:{" "}
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

        {/* Search results */}
        <section className="mt-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <h3 className="font-display text-xl font-semibold text-text">
                {searchTerm
                  ? "Search Results"
                  : "Available Records"}
              </h3>

              <p className="text-sm text-text-muted mt-1">
                {filteredRecords.length}{" "}
                {filteredRecords.length === 1
                  ? "record"
                  : "records"}{" "}
                found
              </p>

            </div>

            <span className="px-3 py-1 rounded-full border border-gray-300 bg-gray-50 text-gray-600 text-xs font-mono tracking-wide">
              {filteredRecords.length} RECORDS
            </span>

          </div>

          {filteredRecords.length > 0 ? (

            <div className="space-y-4">

              {filteredRecords.map((record) => (

                <article
                  key={record._recordId}
                  className="bg-surface border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-md transition"
                >

                  {/* Top */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div>

                      <p className="font-mono text-xs text-primary tracking-wide">
                        {formatDate(
                          record?.date ||
                          record?.documentDate ||
                          record?.createdAt ||
                          record?.eventDate
                        )}
                      </p>

                      <h4 className="font-display text-lg font-semibold text-text mt-2">
                        {getRecordTitle(record)}
                      </h4>

                    </div>

                    <span className="w-fit px-3 py-1 rounded-full border border-primary bg-primary-light text-primary text-xs font-mono tracking-wide">
                      {getRecordType(record)}
                    </span>

                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-muted leading-6 mt-4">
                    {getRecordDescription(record)}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100">

                    <div>

                      <p className="font-mono text-[10px] text-text-muted tracking-wider">
                        HOSPITAL / CLINIC
                      </p>

                      <p className="text-sm text-text mt-1">
                        {record?.hospital ||
                          record?.hospitalName ||
                          "Not available"}
                      </p>

                    </div>

                    <div>

                      <p className="font-mono text-[10px] text-text-muted tracking-wider">
                        DOCTOR
                      </p>

                      <p className="text-sm text-text mt-1">
                        {record?.doctor ||
                          record?.doctorName ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  {/* Source */}
                  <div className="mt-4">

                    <p className="font-mono text-xs text-text-muted">
                      SOURCE:{" "}
                      {String(
                        record?.source ||
                          "CLINOVA RECORD"
                      ).toUpperCase()}
                    </p>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* Empty / no results */
            <section className="bg-surface border border-dashed border-gray-300 rounded-2xl shadow-sm p-10 sm:p-14 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-light flex items-center justify-center text-3xl">
                {searchTerm ? "🔍" : "📁"}
              </div>

              <h3 className="font-display text-xl font-semibold text-text mt-5">
                {searchTerm
                  ? "No matching records found."
                  : "No medical records available yet."}
              </h3>

              <p className="text-text-muted max-w-md mx-auto mt-3 leading-6">
                {searchTerm
                  ? "Try a different search term such as a report name, hospital, doctor or investigation."
                  : "Uploaded reports and other available medical records will appear here."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-display hover:bg-primary-dark transition"
                >
                  Show All Records
                </button>
              )}

            </section>

          )}

        </section>

        {/* Security information */}
        <section className="bg-primary-light border border-primary rounded-2xl p-5 mt-8">

          <div className="flex items-start gap-3">

            <div className="text-xl">
              🔐
            </div>

            <div>

              <h3 className="font-display font-semibold text-primary">
                Your records remain patient-controlled
              </h3>

              <p className="text-primary text-sm mt-1 leading-6">
                Search results are generated from available Clinova
                records. Missing medical information is not
                automatically created.
              </p>

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
              navigate("/timeline")
            }
            className="bg-surface border border-gray-300 text-text py-3 px-4 rounded-xl font-display hover:bg-gray-50 transition"
          >
            Health Timeline
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