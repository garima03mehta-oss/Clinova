export function extractDocumentInfo(fileName) {
  return {
    date: "Not clearly identified",
    hospital: "Not clearly identified",
    documentType: fileName.toLowerCase().includes("report")
      ? "Laboratory Report"
      : "Not clearly identified",
    medication: "Not provided",
    diagnosis: "Not provided",
    source: "DOCUMENT EXTRACTED",
    status: "DRAFT"
  };
}

export function explainDocument(extracted) {
  return `This ${extracted.documentType} was uploaded. AI-generated explanation — please discuss with your doctor.`;
}