import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function ShareConsent() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Share Consent</h1>
      <p>This explicitly authorizes a doctor to view your Clinova record. This is separate from your earlier intake consent.</p>
      <label>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I authorize sharing with a doctor
      </label>
      <br /><br />
      <button disabled={!agreed} onClick={() => navigate("/share-access")}>Continue</button>
    </div>
  );
}