import { useNavigate } from "react-router-dom";
export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Clinova</h1>
      <p>We'll help prepare your medical information before you see the doctor.</p>
      <button onClick={() => navigate("/language")}>Start</button>
    </div>
  );
}