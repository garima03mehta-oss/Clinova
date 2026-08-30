import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNextQuestion, detectComplaint } from "../../../utils/questionEngine";
import { getCompletenessScore } from "../../../utils/completenessScore";
import { checkPriority } from "../../../utils/priorityEngine";

export default function Interview() {
  const [chiefComplaint, setChiefComplaint] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(getNextQuestion(null, {}));
  const [priorityAlert, setPriorityAlert] = useState(null);
  const [textInput, setTextInput] = useState("");
  const navigate = useNavigate();
  const completeness = getCompletenessScore({ chiefComplaint, ...answers });

  const handleYesNo = (value) => {
    const updated = { ...answers, [currentQuestion.key]: value };
    setAnswers(updated);
    const priority = checkPriority({ chestPain: chiefComplaint === "chest pain", ...updated });
    if (priority.flagged) setPriorityAlert(priority.reason);
    setCurrentQuestion(getNextQuestion(chiefComplaint, updated));
  };

  const handleTextSubmit = () => {
    if (!textInput) return;

    if (!chiefComplaint) {
      const detected = detectComplaint(textInput);
      setChiefComplaint(detected);
      setTextInput("");
      setCurrentQuestion(getNextQuestion(detected, {}));
      return;
    }

    navigate("/documents");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-text-muted text-xs font-mono mb-4">Completeness: {completeness}%</p>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
        </div>
        {priorityAlert && (
          <div className="bg-red-50 border border-danger rounded-xl p-3 mb-4">
            <p className="text-danger text-sm font-medium">⚠ {priorityAlert}</p>
          </div>
        )}
        <p className="font-display text-xl text-text mb-6">{currentQuestion.question}</p>

        {currentQuestion.type === "yesno" && (
          <div className="flex gap-3">
            <button onClick={() => handleYesNo(true)} className="flex-1 bg-primary text-white py-3 rounded-xl">Yes</button>
            <button onClick={() => handleYesNo(false)} className="flex-1 bg-surface border-2 border-primary text-primary py-3 rounded-xl">No</button>
          </div>
        )}

        {currentQuestion.type === "text" && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
              rows={4}
            />
            <button disabled={!textInput} onClick={handleTextSubmit} className="w-full bg-primary text-white py-3 rounded-xl disabled:opacity-40">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}