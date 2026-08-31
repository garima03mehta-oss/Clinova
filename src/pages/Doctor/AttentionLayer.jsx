const dummyAlerts = [
  { type: "priority", message: "Potential priority symptom detected: chest pain + breathing difficulty" },
  { type: "incomplete", message: "Allergy history incomplete" },
  { type: "info", message: "Previous discharge summary available" }
];
export default function AttentionLayer() {
  return (
    <div className="min-h-screen px-6 py-12 bg-bg font-body">
  <div className="max-w-md mx-auto">
    <h1 className="font-display text-2xl text-text mb-6">What Needs Your Attention?</h1>
    {dummyAlerts.map((a, i) => (
      <div key={i} className={`rounded-xl p-4 mb-3 border ${
        a.type === "priority" ? "bg-red-50 border-danger" :
        a.type === "incomplete" ? "bg-orange-50 border-warning" :
        "bg-gray-50 border-gray-200"
      }`}>
        <p className={`text-sm font-medium ${a.type === "priority" ? "text-danger" : a.type === "incomplete" ? "text-warning" : "text-text-muted"}`}>{a.message}</p>
      </div>
    ))}
  </div>
</div>
  );
}