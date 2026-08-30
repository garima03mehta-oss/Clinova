import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function EnterAccessCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code your patient shared with you.");
      return;
    }
    localStorage.setItem("clinovaPendingCode", code);
    navigate("/doctor/queue");
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Enter Patient Access Code</h1>
      <p>Ask your patient for the 6-digit code they generated in Clinova. This only starts an access request — it does not grant access by itself.</p>
      <input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
      <br /><br />
      <button onClick={handleSubmit}>Submit</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}