import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Consent() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Consent to Collect Information</h1>
      <p>Clinova will collect your health information to prepare it for your doctor. This does not share it with anyone yet.</p>
      <label>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I Agree
      </label>
      <br /><br />
      <button disabled={!agreed} onClick={() => navigate("/identification")}>Continue</button>
    </div>
  );
}