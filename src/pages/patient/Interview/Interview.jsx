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
      
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">
      <p className="text-text-muted text-xs font-mono mb-4">Completeness: {completeness}%</p>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
      </div>
      {priorityAlert && (
      <div className="bg-red-50 border border-danger rounded-xl p-3 mb-4">
        <p className="text-danger text-sm font-medium">⚠️ {priorityAlert}</p>
      </div>
      )}
      <p className="font-display text-xl text-text mb-6">{currentQuestion}</p>
      <div className="flex gap-3">
      <button onClick={() => handleAnswer("breathingDifficulty", true)} className="flex-1 bg-primary text-white py-3 rounded-xl">Yes</button>
      <button onClick={() => handleAnswer("breathingDifficulty", false)} className="flex-1 bg-surface border-2 border-primary text-primary py-3 rounded-xl">No</button>
      </div>
      </div>
      </div>
    </div>
  );
}
