import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";

function RecordInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <label className="block text-sm text-text-muted mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label}`}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
      />
    </div>
  );
}

function RecordTextarea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">
        {label}
      </label>

      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label}`}
        rows={4}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-text outline-none resize-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
      />
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-4">
      <p className="text-sm text-text-muted">
        {text}
      </p>
    </div>
  );
}

export default function HealthRecord() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(() => {
    try {
      const storedPatient =
        localStorage.getItem("patient") ||
        localStorage.getItem("patientData") ||
        localStorage.getItem("clinovaPatient");

      if (storedPatient) {
        const parsed = JSON.parse(storedPatient);

        return {
          ...parsed,
          name:
            parsed.name ||
            parsed.fullName ||
            parsed.patientName ||
            "",
          dob:
            parsed.dob ||
            parsed.dateOfBirth ||
            "",
          gender: parsed.gender || "",
          clinovaPatientId:
            parsed.clinovaPatientId ||
            parsed.patientId ||
            parsed.id ||
            "",
          allergiesText:
            parsed.allergiesText ||
            (Array.isArray(parsed.allergies)
              ? parsed.allergies.join(", ")
              : parsed.allergies || ""),
          medicationsText:
            parsed.medicationsText ||
            (Array.isArray(parsed.medications)
              ? parsed.medications
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : item?.name || ""
                  )
                  .filter(Boolean)
                  .join(", ")
              : parsed.medications || ""),
          medicalHistoryText:
            parsed.medicalHistoryText ||
            (Array.isArray(parsed.medicalHistory)
              ? parsed.medicalHistory
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : item?.title ||
                        item?.description ||
                        ""
                  )
                  .filter(Boolean)
                  .join("\n")
              : parsed.medicalHistory || ""),
          previousConditionsText:
            parsed.previousConditionsText ||
            (Array.isArray(parsed.previousConditions)
              ? parsed.previousConditions
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : item?.name ||
                        item?.title ||
                        ""
                  )
                  .filter(Boolean)
                  .join(", ")
              : parsed.previousConditions || ""),
        };
      }
    } catch (error) {
      console.error(
        "Unable to read patient information:",
        error
      );
    }

    return {
      name: "",
      dob: "",
      gender: "",
      clinovaPatientId: "",
      allergiesText: "",
      medicationsText: "",
      medicalHistoryText: "",
      previousConditionsText: "",
      documents: [],
    };
  });

  const [saved, setSaved] = useState(false);

  const updatePatient = (field, value) => {
    setPatient((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const saveMedicalRecord = () => {
    try {
      const updatedPatient = {
        ...patient,

        allergies: patient.allergiesText
          ? patient.allergiesText
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        medications: patient.medicationsText
          ? patient.medicationsText
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        medicalHistory: patient.medicalHistoryText
          ? patient.medicalHistoryText
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item) => ({
                title: item,
                description: "",
              }))
          : [],

        previousConditions: patient.previousConditionsText
          ? patient.previousConditionsText
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      setPatient(updatedPatient);

      localStorage.setItem(
        "clinovaPatient",
        JSON.stringify(updatedPatient)
      );

      /*
       * Also update the existing patient/local patient data
       * when those keys are already being used by the application.
       */
      if (localStorage.getItem("patient")) {
        localStorage.setItem(
          "patient",
          JSON.stringify(updatedPatient)
        );
      }

      if (localStorage.getItem("patientData")) {
        localStorage.setItem(
          "patientData",
          JSON.stringify(updatedPatient)
        );
      }

      setSaved(true);
    } catch (error) {
      console.error(
        "Unable to save medical record:",
        error
      );

      setSaved(false);
    }
  };

  const documents = Array.isArray(patient?.documents)
    ? patient.documents
    : [];

  return (
    <div className="min-h-screen bg-bg font-body px-6 py-10">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="font-mono text-xs text-primary mb-2 tracking-wider">
              PERSONAL HEALTH RECORD
            </p>

            <h1 className="font-display text-3xl font-semibold text-text">
              My Medical Record
            </h1>

            <p className="text-text-muted mt-2">
              View and update your health information.
            </p>
          </div>

          <StatusBadge
            status="ACTIVE"
            label="PATIENT RECORD"
          />

        </div>

        {/* Information banner */}
        <div className="bg-primary-light border border-primary rounded-2xl p-5 mb-6">

          <div className="flex items-start gap-3">

            <div className="text-xl">
              🔐
            </div>

            <div>
              <p className="font-display font-medium text-primary">
                Your health record is patient-controlled
              </p>

              <p className="text-primary text-sm mt-1">
                Enter only information that you know or have
                confirmed. Clinova does not automatically invent
                missing medical information.
              </p>
            </div>

          </div>

        </div>

        {/* Personal Information */}
        <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">

          <div className="flex items-center justify-between mb-4">

            <h2 className="font-display text-lg font-semibold text-text">
              Personal Information
            </h2>

            <StatusBadge
              status="ACTIVE"
              label="RECORD"
            />

          </div>

          <RecordInput
            label="Name"
            value={patient.name}
            onChange={(value) =>
              updatePatient("name", value)
            }
            placeholder="Enter your full name"
          />

          <RecordInput
            label="Date of Birth"
            type="date"
            value={patient.dob}
            onChange={(value) =>
              updatePatient("dob", value)
            }
          />

          <RecordInput
            label="Gender"
            value={patient.gender}
            onChange={(value) =>
              updatePatient("gender", value)
            }
            placeholder="Enter gender"
          />

          <RecordInput
            label="Patient ID"
            value={patient.clinovaPatientId}
            onChange={(value) =>
              updatePatient("clinovaPatientId", value)
            }
            placeholder="Enter Clinova Patient ID"
          />

        </section>

        {/* Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Allergies */}
          <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="font-display text-lg font-semibold text-text mb-4">
              Allergies
            </h2>

            <RecordTextarea
              label="Allergy Information"
              value={patient.allergiesText}
              onChange={(value) =>
                updatePatient("allergiesText", value)
              }
              placeholder="Example: Penicillin, peanuts, dust"
            />

            {!patient.allergiesText && (
              <p className="text-xs text-text-muted mt-2">
                If you have no known allergies, you can leave this
                section empty.
              </p>
            )}

          </section>

          {/* Current Medications */}
          <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="font-display text-lg font-semibold text-text mb-4">
              Current Medications
            </h2>

            <RecordTextarea
              label="Medication Information"
              value={patient.medicationsText}
              onChange={(value) =>
                updatePatient("medicationsText", value)
              }
              placeholder="Example: Paracetamol 500mg, Vitamin D"
            />

          </section>

          {/* Medical History */}
          <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="font-display text-lg font-semibold text-text mb-4">
              Medical History
            </h2>

            <RecordTextarea
              label="Medical History"
              value={patient.medicalHistoryText}
              onChange={(value) =>
                updatePatient("medicalHistoryText", value)
              }
              placeholder="Enter previous medical history"
            />

          </section>

          {/* Previous Conditions */}
          <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="font-display text-lg font-semibold text-text mb-4">
              Previous Conditions
            </h2>

            <RecordTextarea
              label="Previous Conditions"
              value={patient.previousConditionsText}
              onChange={(value) =>
                updatePatient(
                  "previousConditionsText",
                  value
                )
              }
              placeholder="Example: Asthma, diabetes, hypertension"
            />

          </section>

        </div>

        {/* Uploaded Reports */}
        <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 mt-5">

          <div className="flex items-center justify-between mb-4">

            <h2 className="font-display text-lg font-semibold text-text">
              Uploaded Reports
            </h2>

            <StatusBadge
              status="ACTIVE"
              label="DOCUMENTS"
            />

          </div>

          {documents.length > 0 ? (

            <div className="space-y-3">

              {documents.slice(0, 5).map(
                (document, index) => (

                  <div
                    key={document?.id || index}
                    className="border border-gray-100 rounded-xl p-4"
                  >

                    <p className="text-sm font-medium text-text">
                      {document?.name ||
                        document?.documentName ||
                        "Medical document"}
                    </p>

                    <p className="text-xs text-text-muted mt-1">
                      {document?.date ||
                        document?.documentDate ||
                        "Date not available"}
                    </p>

                  </div>

                )
              )}

            </div>

          ) : (

            <EmptyText text="No uploaded reports available." />

          )}

        </section>

        {/* Save status */}
        {saved && (
          <div className="mt-5 bg-green-50 border border-success rounded-xl p-4">

            <p className="text-success text-sm font-medium">
              ✓ Medical record saved successfully.
            </p>

            <p className="text-text-muted text-xs mt-1">
              Your updated information is stored locally in
              this Clinova session.
            </p>

          </div>
        )}

        {/* Save button */}
        <button
          onClick={saveMedicalRecord}
          className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-display font-medium hover:bg-primary-dark transition shadow-sm"
        >
          Save Medical Record
        </button>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

          <button
            onClick={() => navigate("/timeline")}
            className="bg-surface border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
          >
            View Health Timeline
          </button>

          <button
            onClick={() => navigate("/search")}
            className="bg-surface border border-gray-200 text-text py-3 px-4 rounded-xl font-display hover:bg-gray-50 transition"
          >
            Search Records
          </button>

          <button
            onClick={() =>
              navigate("/patient/dashboard")
            }
            className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
          >
            Back to Dashboard
          </button>

        </div>

      </div>

    </div>
  );
}