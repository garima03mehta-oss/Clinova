import { useState } from "react";
import { generateEmergencyAccess } from "../../utils/emergencyAccess";
import { logAccessEvent } from "../../utils/auditLog";

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
    logAccessEvent({
      who: "doctor-demo-id",
      what: "EMERGENCY_ACCESS_ACTIVATED",
      why: reason,
      result: "ALLOWED"
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-red-50 font-body text-center">
  <div className="bg-surface border-2 border-danger rounded-2xl p-8 max-w-md shadow-sm">
    <StatusBadge status="EMERGENCY" label="🚨 EMERGENCY ACCESS" />
    <p className="text-text-muted text-sm mt-4">Minimum necessary information only. Time-limited. Fully logged.</p>
    <input placeholder="Reason for emergency access" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-4 w-full border border-gray-300 rounded-xl px-4 py-3" />
    <button onClick={handleActivate} disabled={!reason} className="mt-4 w-full bg-danger text-white py-3 rounded-xl disabled:opacity-40">
      Activate Emergency Access
    </button>
  </div>
</div>
  );
}
