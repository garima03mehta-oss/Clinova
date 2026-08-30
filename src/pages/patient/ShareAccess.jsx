import { useState } from "react";
import { generateAccessCode } from "../../utils/accessCode";
export default function ShareAccess() {
  const [scope, setScope] = useState({ clinicalSummary: true, timeline: true, reports: false });
  const [duration, setDuration] = useState(60);
  const [access, setAccess] = useState(null);

  const toggleScope = (key) => setScope({ ...scope, [key]: !scope[key] });

  const handleGenerate = () => {
    const newAccess = generateAccessCode(scope, duration);
    setAccess(newAccess);
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
        <div>
          <h2>{access.code}</h2>
          <p>Status: {access.status} — give this code to your doctor. It only starts a request; the doctor still needs authorization.</p>
        </div>
      )}
    </div>
  );
}