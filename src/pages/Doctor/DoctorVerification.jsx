import { useState } from "react";
import { logAccessEvent } from "../../utils/auditLog";

export default function DoctorVerification() {
  const [status, setStatus] = useState("DRAFT");

  const handleVerify = async () => {
    setStatus("VERIFIED");
    await logAccessEvent({
      who: "currentDoctorId",
      what: "RECORD_VERIFIED",
      why: "Doctor confirmed AI draft as official record",
      result: "ALLOWED"
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
  <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
    <StatusBadge status={status} label={status === "DRAFT" ? "AI-Generated Clinical Draft" : "Official Clinical Record"} />
    <p className="text-text-muted text-sm mt-4">Review the clinical summary before confirming it as the official record.</p>
    {status === "DRAFT" && (
      <button onClick={handleVerify} className="mt-6 w-full bg-primary text-white py-3 rounded-xl">
        Verify & Make Official
      </button>
    )}
    {status === "VERIFIED" && <p className="text-success mt-4 font-medium">✓ Saved as official record</p>}
  </div>
</div>
  );
}