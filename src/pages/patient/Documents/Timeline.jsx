const dummyDocs = [
  { date: "2024", type: "Investigation", source: "DOCUMENT EXTRACTED", status: "VERIFIED" },
  { date: "2025", type: "Hospital Admission", source: "DOCUMENT EXTRACTED", status: "VERIFIED" },
  { date: "2025", type: "Prescription", source: "PATIENT REPORTED", status: "VERIFIED" }
];
export default function Timeline() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Medical Timeline</h1>
      {dummyDocs.map((doc, i) => (
        <p key={i}>{doc.date} → {doc.type} <span style={{ fontSize: "11px", color: "gray" }}>({doc.source}, {doc.status})</span></p>
      ))}
    </div>
  );
}