import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function CareSystemSelection() {
  const navigate = useNavigate();
  const [previousSelection, setPreviousSelection] = useState(null);
  useEffect(() => {
    const saved = localStorage.getItem("clinovaCareSystem");
    if (saved) setPreviousSelection(saved);
  }, []);
  const selectCareSystem = (system) => {
    localStorage.setItem("clinovaCareSystem", system);
    navigate("/interview");
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Care System for This Consultation</h1>
      {previousSelection && <p>Last time you chose: {previousSelection}. You can change this for today.</p>}
      <button onClick={() => selectCareSystem("allopathy")} style={{ margin: "10px" }}>🩺 Allopathy</button>
      <button onClick={() => selectCareSystem("ayush")} style={{ margin: "10px" }}>🌿 AYUSH</button>
      <button onClick={() => selectCareSystem("both")} style={{ margin: "10px" }}>🔄 Both</button>
    </div>
  );
}