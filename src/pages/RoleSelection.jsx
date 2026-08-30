import { useNavigate } from "react-router-dom";
export default function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Who are you?</h1>
      <button onClick={() => navigate("/patient/login")} style={{ margin: "10px", padding: "10px 20px" }}>👤 Patient</button>
      <button onClick={() => navigate("/doctor")} style={{ margin: "10px", padding: "10px 20px" }}>👨‍⚕️ Doctor</button>
    </div>
  );
}