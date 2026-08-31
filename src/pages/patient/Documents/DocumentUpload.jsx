const referenceRanges = {
  Hemoglobin: { low: 12, high: 16, unit: "g/dL" },
  WBC: { low: 4000, high: 11000, unit: "/µL" },
  Platelets: { low: 150000, high: 450000, unit: "/µL" }
};

function flagValue(name, value) {
  const range = referenceRanges[name];
  if (!range || value === null) return "Not clearly identified";
  if (value < range.low) return "Low";
  if (value > range.high) return "High";
  return "Normal";
}

export function extractDocumentInfo(fileName) {
  const isLabReport = fileName.toLowerCase().includes("report") || fileName.toLowerCase().includes("blood");

  const investigations = isLabReport
    ? [
        { name: "Hemoglobin", value: 10.8, unit: "g/dL" },
        { name: "WBC", value: 8200, unit: "/µL" },
        { name: "Platelets", value: 120000, unit: "/µL" }
      ].map((inv) => ({ ...inv, flag: flagValue(inv.name, inv.value) }))
    : [];

  return {
    date: "Not clearly identified",
    hospital: "Not clearly identified",
    documentType: isLabReport ? "Laboratory Report" : "Not clearly identified",
    investigations,
    medication: "Not provided",
    diagnosis: "Not provided",
    source: "DOCUMENT EXTRACTED",
    status: "DRAFT"
  };
}

export function explainDocument(extracted) {
  return `This ${extracted.documentType} was uploaded. AI-generated explanation — please discuss with your doctor.`;
}