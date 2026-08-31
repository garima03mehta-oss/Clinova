import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { generateAccessCode } from "../../utils/accessCode";

export default function ShareAccess() {
  const [scope, setScope] = useState({ clinicalSummary: true, timeline: true, reports: false });
  const [duration, setDuration] = useState(60);
  const [access, setAccess] = useState(null);

  const toggleScope = (key) => setScope({ ...scope, [key]: !scope[key] });

  const handleGenerate = async () => {
    const patientId = localStorage.getItem("clinovaPatientId");
    const newAccess = generateAccessCode(scope, duration);
    const docRef = await addDoc(collection(db, "accessRequests"), { ...newAccess, patientId });
    setAccess({ ...newAccess, id: docRef.id });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Share With Doctor</h1>
      <div>
        <label><input type="checkbox" checked={scope.clinicalSummary} onChange={() => toggleScope("clinicalSummary")} /> Clinical Summary</label><br />
        <label><input type="checkbox" checked={scope.timeline} onChange={() => toggleScope("timeline")} /> Medical Timeline</label><br />
        <label><input type="checkbox" checked={scope.reports} onChange={() => toggleScope("reports")} /> Reports</label>
      </div>
      <br />
      <div>
        <label><input type="radio" name="duration" checked={duration === 60} onChange={() => setDuration(60)} /> 1 Hour</label>
        <label><input type="radio" name="duration" checked={duration === 1440} onChange={() => setDuration(1440)} /> 24 Hours</label>
        <label><input type="radio" name="duration" checked={duration === 10080} onChange={() => setDuration(10080)} /> 7 Days</label>
      </div>
      <br />
      <button onClick={handleGenerate}>Generate Secure Access</button>
     {access && (
       <div className="mt-6 bg-primary-light border-2 border-primary rounded-2xl p-8 text-center">
       <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Secure Access Code</p>
       <h2 className="font-mono text-5xl font-semibold text-primary-dark tracking-[0.2em]">{access.code}</h2>
       <StatusBadge status={access.status} label={access.status} />
       <p className="text-text-muted text-sm mt-4">Give this code to your doctor. It expires automatically.</p>
       </div>
       )}
    </div>
  );
}