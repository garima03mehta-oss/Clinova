import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authorizeAccess } from "../../utils/accessCode";
import { logAccessEvent } from "../../utils/auditLog";

export default function EnterAccessCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code your patient shared with you.");
      return;
    }
    const pendingRequest = { code, status: "PENDING", expiresAt: Date.now() + 60 * 60 * 1000 };
    const result = authorizeAccess(pendingRequest, "currentDoctorId");
    logAccessEvent({
      who: "currentDoctorId",
      what: "ACCESS_REQUEST_SUBMITTED",
      why: "Doctor entered patient code",
      result: result.authorized ? "ALLOWED" : "DENIED"
    });
    if (!result.authorized) {
      setError(result.reason);
      return;
    }
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