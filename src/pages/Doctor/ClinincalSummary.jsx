const dummySummary = {
  chiefComplaint: "Chest pain",
  hpi: "Reported for 2 days, associated with breathing difficulty",
  medicationHistory: "Not provided",
  allergyHistory: "Not provided",
  familyHistory: "Not provided"
};
export default function ClinicalSummary() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Clinical Summary</h1>
      <p style={{ fontSize: "12px", color: "orange" }}>Status: AI Draft — physician verification required.</p>
      {Object.entries(dummySummary).map(([key, value]) => (
        <p key={key}><strong>{key}:</strong> {value}</p>
      ))}
    </div>
  );
}