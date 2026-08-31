import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Identification() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const handleContinue = () => {
    localStorage.setItem("clinovaPatient", JSON.stringify({ name, age, phone }));
   navigate("/patient/dashboard");;
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Your Details</h1>
      <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} /><br />
      <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} /><br />
      <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} /><br /><br />
      <button disabled={!name || !age} onClick={handleContinue}>Continue</button>
    </div>
  );
}