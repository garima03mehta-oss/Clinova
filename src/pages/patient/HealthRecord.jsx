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
return ( <div className="py-3 border-b border-gray-100 last:border-b-0"> <label className="block text-sm text-text-muted mb-2">
{label} </label>


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
return ( <div> <label className="block text-sm text-text-muted mb-2">
{label} </label>

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
return ( <div className="bg-gray-50 rounded-xl px-4 py-4"> <p className="text-sm text-text-muted">
{text} </p> </div>
);
}

export default function HealthRecord() {
const navigate = useNavigate();

const isHindi =
localStorage.getItem("clinovaLanguage") === "hi";

const t = {
personalHealthRecord: isHindi
? "व्यक्तिगत स्वास्थ्य रिकॉर्ड"
: "PERSONAL HEALTH RECORD",

title: isHindi
  ? "मेरा मेडिकल रिकॉर्ड"
  : "My Medical Record",

subtitle: isHindi
  ? "अपनी स्वास्थ्य संबंधी जानकारी देखें और अपडेट करें।"
  : "View and update your health information.",

patientRecord: isHindi
  ? "मरीज़ रिकॉर्ड"
  : "PATIENT RECORD",

active: isHindi
  ? "सक्रिय"
  : "ACTIVE",

record: isHindi
  ? "रिकॉर्ड"
  : "RECORD",

documents: isHindi
  ? "दस्तावेज़"
  : "DOCUMENTS",

controlledTitle: isHindi
  ? "आपका स्वास्थ्य रिकॉर्ड आपके नियंत्रण में है"
  : "Your health record is patient-controlled",

controlledText: isHindi
  ? "केवल वही जानकारी दर्ज करें जिसे आप जानते हैं या जिसकी पुष्टि कर चुके हैं। Clinova अपने आप कोई मेडिकल जानकारी नहीं बनाता।"
  : "Enter only information that you know or have confirmed. Clinova does not automatically invent missing medical information.",

personalInformation: isHindi
  ? "व्यक्तिगत जानकारी"
  : "Personal Information",

name: isHindi
  ? "नाम"
  : "Name",

fullName: isHindi
  ? "अपना पूरा नाम दर्ज करें"
  : "Enter your full name",

dob: isHindi
  ? "जन्म तिथि"
  : "Date of Birth",

gender: isHindi
  ? "लिंग"
  : "Gender",

enterGender: isHindi
  ? "लिंग दर्ज करें"
  : "Enter gender",

patientId: isHindi
  ? "मरीज़ आईडी"
  : "Patient ID",

enterPatientId: isHindi
  ? "Clinova मरीज़ आईडी दर्ज करें"
  : "Enter Clinova Patient ID",

allergies: isHindi
  ? "एलर्जी"
  : "Allergies",

allergyInformation: isHindi
  ? "एलर्जी की जानकारी"
  : "Allergy Information",

allergyPlaceholder: isHindi
  ? "उदाहरण: पेनिसिलिन, मूंगफली, धूल"
  : "Example: Penicillin, peanuts, dust",

noAllergyHint: isHindi
  ? "अगर आपको किसी चीज़ से एलर्जी नहीं है, तो आप इस सेक्शन को खाली छोड़ सकते हैं।"
  : "If you have no known allergies, you can leave this section empty.",

medications: isHindi
  ? "वर्तमान दवाइयाँ"
  : "Current Medications",

medicationInformation: isHindi
  ? "दवाइयों की जानकारी"
  : "Medication Information",

medicationPlaceholder: isHindi
  ? "उदाहरण: पैरासिटामोल 500mg, विटामिन D"
  : "Example: Paracetamol 500mg, Vitamin D",

medicalHistory: isHindi
  ? "मेडिकल इतिहास"
  : "Medical History",

enterMedicalHistory: isHindi
  ? "पिछला मेडिकल इतिहास दर्ज करें"
  : "Enter previous medical history",

previousConditions: isHindi
  ? "पिछली स्वास्थ्य समस्याएँ"
  : "Previous Conditions",

previousConditionsPlaceholder: isHindi
  ? "उदाहरण: अस्थमा, मधुमेह, उच्च रक्तचाप"
  : "Example: Asthma, diabetes, hypertension",

uploadedReports: isHindi
  ? "अपलोड की गई रिपोर्ट"
  : "Uploaded Reports",

medicalDocument: isHindi
  ? "मेडिकल दस्तावेज़"
  : "Medical document",

dateNotAvailable: isHindi
  ? "तिथि उपलब्ध नहीं है"
  : "Date not available",

noReports: isHindi
  ? "कोई अपलोड की गई रिपोर्ट उपलब्ध नहीं है।"
  : "No uploaded reports available.",

saved: isHindi
  ? "✓ मेडिकल रिकॉर्ड सफलतापूर्वक सेव हो गया।"
  : "✓ Medical record saved successfully.",

savedText: isHindi
  ? "आपकी अपडेट की गई जानकारी इस Clinova सेशन में स्थानीय रूप से सेव है।"
  : "Your updated information is stored locally in this Clinova session.",

save: isHindi
  ? "मेडिकल रिकॉर्ड सेव करें"
  : "Save Medical Record",

timeline: isHindi
  ? "हेल्थ टाइमलाइन देखें"
  : "View Health Timeline",

search: isHindi
  ? "रिकॉर्ड खोजें"
  : "Search Records",

dashboard: isHindi
  ? "डैशबोर्ड पर वापस जाएँ"
  : "Back to Dashboard",

enter: isHindi
  ? "दर्ज करें"
  : "Enter",


};

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

      gender:
        parsed.gender || "",

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

    previousConditions:
      patient.previousConditionsText
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

const documents = Array.isArray(
patient?.documents
)
? patient.documents
: [];

return ( <div className="min-h-screen bg-bg font-body px-6 py-10">


  <div className="max-w-5xl mx-auto">

    {/* Header */}

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

      <div>

        <p className="font-mono text-xs text-primary mb-2 tracking-wider">
          {t.personalHealthRecord}
        </p>

        <h1 className="font-display text-3xl font-semibold text-text">
          {t.title}
        </h1>

        <p className="text-text-muted mt-2">
          {t.subtitle}
        </p>

      </div>

      <StatusBadge
        status="ACTIVE"
        label={t.patientRecord}
      />

    </div>


    {/* Information Banner */}

    <div className="bg-primary-light border border-primary rounded-2xl p-5 mb-6">

      <div className="flex items-start gap-3">

        <div className="text-xl">
          🔐
        </div>

        <div>

          <p className="font-display font-medium text-primary">
            {t.controlledTitle}
          </p>

          <p className="text-primary text-sm mt-1">
            {t.controlledText}
          </p>

        </div>

      </div>

    </div>


    {/* Personal Information */}

    <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">

      <div className="flex items-center justify-between mb-4">

        <h2 className="font-display text-lg font-semibold text-text">
          {t.personalInformation}
        </h2>

        <StatusBadge
          status="ACTIVE"
          label={t.record}
        />

      </div>

      <RecordInput
        label={t.name}
        value={patient.name}
        onChange={(value) =>
          updatePatient("name", value)
        }
        placeholder={t.fullName}
      />

      <RecordInput
        label={t.dob}
        type="date"
        value={patient.dob}
        onChange={(value) =>
          updatePatient("dob", value)
        }
      />

      <RecordInput
        label={t.gender}
        value={patient.gender}
        onChange={(value) =>
          updatePatient("gender", value)
        }
        placeholder={t.enterGender}
      />

      <RecordInput
        label={t.patientId}
        value={patient.clinovaPatientId}
        onChange={(value) =>
          updatePatient(
            "clinovaPatientId",
            value
          )
        }
        placeholder={t.enterPatientId}
      />

    </section>


    {/* Medical Information */}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Allergies */}

      <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="font-display text-lg font-semibold text-text mb-4">
          {t.allergies}
        </h2>

        <RecordTextarea
          label={t.allergyInformation}
          value={patient.allergiesText}
          onChange={(value) =>
            updatePatient(
              "allergiesText",
              value
            )
          }
          placeholder={t.allergyPlaceholder}
        />

        {!patient.allergiesText && (
          <p className="text-xs text-text-muted mt-2">
            {t.noAllergyHint}
          </p>
        )}

      </section>


      {/* Current Medications */}

      <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="font-display text-lg font-semibold text-text mb-4">
          {t.medications}
        </h2>

        <RecordTextarea
          label={t.medicationInformation}
          value={patient.medicationsText}
          onChange={(value) =>
            updatePatient(
              "medicationsText",
              value
            )
          }
          placeholder={t.medicationPlaceholder}
        />

      </section>


      {/* Medical History */}

      <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="font-display text-lg font-semibold text-text mb-4">
          {t.medicalHistory}
        </h2>

        <RecordTextarea
          label={t.medicalHistory}
          value={patient.medicalHistoryText}
          onChange={(value) =>
            updatePatient(
              "medicalHistoryText",
              value
            )
          }
          placeholder={t.enterMedicalHistory}
        />

      </section>


      {/* Previous Conditions */}

      <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="font-display text-lg font-semibold text-text mb-4">
          {t.previousConditions}
        </h2>

        <RecordTextarea
          label={t.previousConditions}
          value={
            patient.previousConditionsText
          }
          onChange={(value) =>
            updatePatient(
              "previousConditionsText",
              value
            )
          }
          placeholder={
            t.previousConditionsPlaceholder
          }
        />

      </section>

    </div>


    {/* Uploaded Reports */}

    <section className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 mt-5">

      <div className="flex items-center justify-between mb-4">

        <h2 className="font-display text-lg font-semibold text-text">
          {t.uploadedReports}
        </h2>

        <StatusBadge
          status="ACTIVE"
          label={t.documents}
        />

      </div>

      {documents.length > 0 ? (

        <div className="space-y-3">

          {documents
            .slice(0, 5)
            .map(
              (document, index) => (

                <div
                  key={
                    document?.id ||
                    index
                  }
                  className="border border-gray-100 rounded-xl p-4"
                >

                  <p className="text-sm font-medium text-text">

                    {document?.name ||
                      document?.documentName ||
                      t.medicalDocument}

                  </p>

                  <p className="text-xs text-text-muted mt-1">

                    {document?.date ||
                      document?.documentDate ||
                      t.dateNotAvailable}

                  </p>

                </div>

              )
            )}

        </div>

      ) : (

        <EmptyText
          text={t.noReports}
        />

      )}

    </section>


    {/* Save Status */}

    {saved && (
      <div className="mt-5 bg-green-50 border border-success rounded-xl p-4">

        <p className="text-success text-sm font-medium">
          {t.saved}
        </p>

        <p className="text-text-muted text-xs mt-1">
          {t.savedText}
        </p>

      </div>
    )}


    {/* Save Button */}

    <button
      onClick={saveMedicalRecord}
      className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-display font-medium hover:bg-primary-dark transition shadow-sm"
    >
      {t.save}
    </button>


    {/* Navigation */}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

      <button
        onClick={() =>
          navigate("/timeline")
        }
        className="bg-surface border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
      >
        {t.timeline}
      </button>

      <button
        onClick={() =>
          navigate("/search")
        }
        className="bg-surface border border-gray-200 text-text py-3 px-4 rounded-xl font-display hover:bg-gray-50 transition"
      >
        {t.search}
      </button>

      <button
        onClick={() =>
          navigate("/patient/dashboard")
        }
        className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
      >
        {t.dashboard}
      </button>

    </div>

  </div>

</div>


);
}
