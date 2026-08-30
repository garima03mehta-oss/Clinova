<<<<<<< HEAD

import { useNavigate } from "react-router-dom";
export default function Language() {
  const navigate = useNavigate();
  const selectLanguage = (lang) => {
    localStorage.setItem("clinovaLanguage", lang);
    navigate("/consent");
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Choose Your Language</h1>
      <button onClick={() => selectLanguage("hindi")} style={{ margin: "10px" }}>हिंदी</button>
      <button onClick={() => selectLanguage("english")} style={{ margin: "10px" }}>English</button>
    </div>
  );
}
=======
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
