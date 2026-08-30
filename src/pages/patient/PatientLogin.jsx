import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function PatientLogin() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const handleContinue = () => {
    localStorage.setItem("clinovaPatientPhone", phone);
    navigate("/welcome");
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Patient Login</h1>
      <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <br /><br />
      <button disabled={!phone} onClick={handleContinue}>Continue</button>
    </div>
  );
} 
>>>>>>> origin/feature/role-selection-patient-login
