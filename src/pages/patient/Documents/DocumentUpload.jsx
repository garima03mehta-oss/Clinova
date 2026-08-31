import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { getNextQuestion } from "../../../utils/questionEngine";
import { getCompletenessScore } from "../../../utils/completenessScore";
import { checkPriority } from "../../../utils/priorityEngine";

export default function Interview() {
  const [chiefComplaint] = useState("chest pain");
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(getNextQuestion(chiefComplaint, {}));
  const [priorityAlert, setPriorityAlert] = useState(null);
  const navigate = useNavigate();
  const completeness = getCompletenessScore({ chiefComplaint, ...answers });

  const handleAnswer = async (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    const priority = checkPriority({ chestPain: chiefComplaint === "chest pain", ...updated });
    if (priority.flagged) setPriorityAlert(priority.reason);
    const next = getNextQuestion(chiefComplaint, updated);
    setCurrentQuestion(next);
    if (next.includes("own words")) {
      const patientId = localStorage.getItem("clinovaPatientId");
      await setDoc(doc(db, "clinicalHistories", patientId), {
        chiefComplaint,
        answers: updated,
        completeness,
        priorityFlag: priorityAlert,
        createdAt: Date.now()
      });
      navigate("/documents");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Clinical Interview</h1>
      <p>History Completeness: {completeness}%</p>
      {priorityAlert && <p style={{ color: "red", fontWeight: "bold" }}>⚠️ {priorityAlert}</p>}
      <p>{currentQuestion}</p>
      <button onClick={() => handleAnswer("breathingDifficulty", true)}>Yes</button>
      <button onClick={() => handleAnswer("breathingDifficulty", false)}>No</button>
    </div>
  );
}
