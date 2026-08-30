import { useNavigate } from "react-router-dom";
export default function HealthRecord() {
  const navigate = useNavigate();
  const sections = [
    { label: "Medical Timeline", path: "/timeline" },
    { label: "Uploaded Reports", path: "/documents" },
    { label: "Search Records", path: "/search" }
  ];
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>My Health Record</h1>
      {sections.map((s) => (
        <div key={s.path} style={{ margin: "10px" }}>
          <button onClick={() => navigate(s.path)}>{s.label}</button>
        </div>
      ))}
    </div>
  );
}