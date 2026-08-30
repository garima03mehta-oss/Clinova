const dummyAlerts = [
  { type: "priority", message: "Potential priority symptom detected: chest pain + breathing difficulty" },
  { type: "incomplete", message: "Allergy history incomplete" },
  { type: "info", message: "Previous discharge summary available" }
];
export default function AttentionLayer() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>What Needs Your Attention?</h1>
      {dummyAlerts.map((a, i) => (
        <p key={i} style={{ color: a.type === "priority" ? "red" : a.type === "incomplete" ? "orange" : "gray" }}>
          {a.message}
        </p>
      ))}
    </div>
  );
}