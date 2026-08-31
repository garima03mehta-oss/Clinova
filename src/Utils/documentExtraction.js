// src/utils/documentExtraction.js

export async function extractDocumentInfo(file) {
  if (!file) {
    throw new Error("Please select a medical document.");
  }

  if (!(file instanceof File)) {
    throw new Error("Invalid file selected.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documentExtraction", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(
      "Document extraction API error:",
      data
    );

    throw new Error(
      data.error ||
        "Unable to analyze the medical document."
    );
  }

  return {
    documentType:
      data.documentType || "Medical Document",

    date:
      data.date || "Not clearly identified",

    hospital:
      data.hospital || "Not clearly identified",

    doctor:
      data.doctor || "",

    patientName:
      data.patientName || "",

    clinicalIndication:
      data.clinicalIndication || "",

    investigations:
      Array.isArray(data.investigations)
        ? data.investigations
        : [],

    findings:
      Array.isArray(data.findings)
        ? data.findings
        : [],

    impression:
      data.impression || "",

    medications:
      Array.isArray(data.medications)
        ? data.medications
        : [],

    diagnosis:
      Array.isArray(data.diagnosis)
        ? data.diagnosis
        : [],

    recommendations:
      Array.isArray(data.recommendations)
        ? data.recommendations
        : [],

    otherInformation:
      Array.isArray(data.otherInformation)
        ? data.otherInformation
        : [],

    aiExplanation:
      data.aiExplanation ||
      "The extracted information is an AI-generated draft and should be verified by a qualified healthcare professional.",

    status: "DRAFT",

    source: "GEMINI_DOCUMENT_EXTRACTION",
  };
}

export function explainDocument(extracted) {
  if (!extracted) {
    return "No document information is available.";
  }

  if (extracted.aiExplanation) {
    return extracted.aiExplanation;
  }

  return `Clinova identified this as a ${
    extracted.documentType || "medical document"
  }. The extracted information is an AI-generated draft and should be verified by a qualified healthcare professional.`;
}