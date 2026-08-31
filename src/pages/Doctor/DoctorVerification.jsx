import { useState } from "react";
import { logAccessEvent } from "../../utils/auditLog";

export default function DoctorVerification() {
  const [status, setStatus] = useState("DRAFT");

  const handleVerify = () => {
    setStatus("VERIFIED");
    logAccessEvent({
      who: "currentDoctorId",
      what: "RECORD_VERIFIED",
      why: "Doctor confirmed AI draft as official record",
      result: "ALLOWED"
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Doctor Verification</h1>
      <p style={{ color: status === "DRAFT" ? "orange" : "green" }}>
        Status: {status === "DRAFT" ? "AI Draft — Unverified" : "Official Clinical Record — Verified"}
      </p>
      <p>Review the clinical summary before confirming it as the official record.</p>
      {status === "DRAFT" && <button onClick={handleVerify}>Verify & Make Official</button>}
      {status === "VERIFIED" && <p>This record is now official and saved.</p>}
    </div>
  );
}