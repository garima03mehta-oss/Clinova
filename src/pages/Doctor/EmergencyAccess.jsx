import { useState } from "react";
import { generateEmergencyAccess } from "../../utils/emergencyAccess";

const dummyEmergencyData = {
  allergyHistory: "Penicillin allergy reported",
  priorityFlags: "Chest pain with breathing difficulty",
  chiefComplaint: "Chest pain"
};

export default function EmergencyAccess() {
  const [session, setSession] = useState(null);
  const [reason, setReason] = useState("");

  const handleActivate = () => {
    const newSession = generateEmergencyAccess("patient-demo-id", "doctor-demo-id");
    setSession(newSession);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red" }}>🚨 EMERGENCY ACCESS</h1>
      <p>This bypasses normal patient sharing and shows only minimum necessary information for urgent care. This access is time-limited and fully logged.</p>
      <input placeholder="Reason for emergency access" value={reason} onChange={(e) => setReason(e.target.value)} />
      <br /><br />
      <button onClick={handleActivate} disabled={!reason}>Activate Emergency Access</button>
      {session && (
        <div>
          <p style={{ color: "red", fontWeight: "bold" }}>EMERGENCY ACCESS ACTIVE — expires in 15 minutes</p>
          <p>Allergy History: {dummyEmergencyData.allergyHistory}</p>
          <p>Priority Flags: {dummyEmergencyData.priorityFlags}</p>
          <p>Chief Complaint: {dummyEmergencyData.chiefComplaint}</p>
        </div>
      )}
    </div>
  );
}