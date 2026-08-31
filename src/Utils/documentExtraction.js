export async function extractDocumentInfo(
  file
) {
  if (!file) {
    throw new Error(
      "Please select a medical document."
    );
  }

  if (!(file instanceof File)) {
    throw new Error(
      "Invalid document selected."
    );
  }

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (
    !allowedTypes.includes(file.type)
  ) {
    throw new Error(
      "Please upload a PDF, JPG, JPEG or PNG medical document."
    );
  }

  console.log(
    "Sending actual document to AI:",
    file.name
  );

  const formData = new FormData();

  /*
   * IMPORTANT:
   * The backend expects the field name "file".
   */
  formData.append("file", file);

  let response;

  try {
    response = await fetch(
      "/api/documentExtraction",
      {
        method: "POST",
        body: formData,
      }
    );
  } catch (networkError) {
    console.error(
      "Document extraction network error:",
      networkError
    );

    throw new Error(
      "Unable to connect to the document extraction service."
    );
  }

  console.log(
    "Document extraction API response:",
    response.status
  );

  const data =
    await response.json().catch(
      () => ({})
    );

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

  /*
   * Backend can return either:
   *
   * 1. Gemini result
   * 2. Safe fallback result
   *
   * Both are valid extraction results.
   */

  if (!data) {
    throw new Error(
      "No document analysis was returned."
    );
  }

  return {
    documentType:
      data.documentType ||
      "Medical Document",

    date: data.date || "",
    hospital: data.hospital || "",
    doctor: data.doctor || "",
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
      Array.isArray(
        data.otherInformation
      )
        ? data.otherInformation
        : [],

    aiExplanation:
      data.aiExplanation ||
      "Document information was extracted as a draft. Please verify it with a qualified healthcare professional.",

    status:
      data.status || "DRAFT",

    aiAvailable:
      data.aiAvailable !== false,

    aiError:
      data.aiError || "",
  };
}


/*
 * ---------------------------------------------------------
 * PATIENT-FRIENDLY DOCUMENT EXPLANATION
 * ---------------------------------------------------------
 */

export function explainDocument(
  extracted
) {
  if (!extracted) {
    return "No document information is available.";
  }

  /*
   * If Gemini already generated an explanation,
   * prefer that explanation.
   */

  if (
    extracted.aiExplanation &&
    typeof extracted.aiExplanation ===
      "string"
  ) {
    return extracted.aiExplanation;
  }

  const parts = [];

  if (extracted.documentType) {
    parts.push(
      `This appears to be a ${extracted.documentType}.`
    );
  }

  if (
    Array.isArray(
      extracted.investigations
    ) &&
    extracted.investigations.length > 0
  ) {
    parts.push(
      `${extracted.investigations.length} investigation(s) were identified in the document.`
    );
  }

  if (
    Array.isArray(
      extracted.findings
    ) &&
    extracted.findings.length > 0
  ) {
    parts.push(
      `${extracted.findings.length} finding(s) were identified.`
    );
  }

  if (
    Array.isArray(
      extracted.medications
    ) &&
    extracted.medications.length > 0
  ) {
    parts.push(
      `${extracted.medications.length} medication record(s) were identified.`
    );
  }

  if (
    extracted.impression
  ) {
    parts.push(
      "The document also contains a reported impression."
    );
  }

  if (
    extracted.aiAvailable === false
  ) {
    parts.push(
      "AI analysis is temporarily unavailable, so detailed document interpretation was not performed."
    );
  }

  parts.push(
    "This information is an AI-generated draft and should be verified by a qualified healthcare professional."
  );

  return parts.join(" ");
}