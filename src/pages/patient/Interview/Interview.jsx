import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompletenessScore } from "../../../utils/completenessScore";
import { checkPriority } from "../../../utils/priorityEngine";

export default function Interview() {
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "text",
    question: "What symptoms are you facing?",
    key: "chiefComplaint",
  });

  const [priorityAlert, setPriorityAlert] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const completeness = getCompletenessScore({
    chiefComplaint,
    hpi: Object.values(answers).join(" "),
    adaptiveAnswers: answers,
  });

  // Send the patient's information to Gemini
  const askGemini = async (symptomText, history) => {
    setLoading(true);

    try {
      const response = await fetch("/api/get-adaptive-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get questions from Gemini");
      };

      const data = await response.json();

      if (data.chiefComplaint && !chiefComplaint) {
        setChiefComplaint(data.chiefComplaint);
      }

      if (
        Array.isArray(data.followUpQuestions) &&
        data.followUpQuestions.length > 0
      ) {
        const next = data.followUpQuestions[0];

        setCurrentQuestion({
          type: "yesno",
          question: next.question,
          key: next.key,
        });

        setSelectedAnswer(null);
      } else {
        setCurrentQuestion({
          type: "complete",
          question:
            "Thank you. We have collected the available information.",
        });
      }
    } catch (error) {
      console.error("Gemini error:", error);

      setCurrentQuestion({
        type: "text",
        question:
          "Please provide any other details about your symptoms.",
        key: "additionalDetails",
      });
    } finally {
      setLoading(false);
    }
  };

  // Select Yes or No without immediately moving forward
  const handleYesNoSelect = (value) => {
    setSelectedAnswer(value);
  };

  // Continue after answering a Yes/No question
  const handleYesNoContinue = async () => {
    if (selectedAnswer === null || loading) return;

    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: selectedAnswer,
    };

    setAnswers(updatedAnswers);

    const priority = checkPriority({
      chestPain: chiefComplaint === "chest pain",
      ...updatedAnswers,
    });

    if (priority.flagged) {
      setPriorityAlert(priority.reason);
    }

    await askGemini(chiefComplaint, {
      chiefComplaint,
      ...updatedAnswers,
    });
  };

  // Continue after a text answer
  const handleTextSubmit = async () => {
    const answer = textInput.trim();

    if (!answer || loading) return;

    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: answer,
    };

    setAnswers(updatedAnswers);
    setTextInput("");

    // First response is the patient's main complaint
    if (!chiefComplaint) {
      setChiefComplaint(answer);

      await askGemini(answer, {
        ...updatedAnswers,
        chiefComplaint: answer,
      });

      return;
    }

    await askGemini(chiefComplaint, {
      chiefComplaint,
      ...updatedAnswers,
    });
  };

  const handleComplete = () => {
    navigate("/documents");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Completeness */}
        <p className="text-text-muted text-xs font-mono mb-4">
          Completeness: {completeness}%
        </p>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${completeness}%` }}
          />
        </div>

        {/* Priority alert */}
        {priorityAlert && (
          <div className="bg-red-50 border border-danger rounded-xl p-3 mb-4">
            <p className="text-danger text-sm font-medium">
              ⚠ {priorityAlert}
            </p>
          </div>
        )}

        {/* Question */}
        <p className="font-display text-xl text-text mb-6">
          {currentQuestion.question}
        </p>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-text-muted mb-4">
            Preparing your next question...
          </p>
        )}

        {/* Yes / No */}
        {currentQuestion.type === "yesno" && !loading && (
          <div>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleYesNoSelect(true)}
                className={`flex-1 py-3 rounded-xl border-2 ${
                  selectedAnswer === true
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-primary text-primary"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => handleYesNoSelect(false)}
                className={`flex-1 py-3 rounded-xl border-2 ${
                  selectedAnswer === false
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-primary text-primary"
                }`}
              >
                No
              </button>
            </div>

            <button
              disabled={selectedAnswer === null}
              onClick={handleYesNoContinue}
              className="w-full bg-primary text-white py-3 rounded-xl disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* Text answer */}
        {currentQuestion.type === "text" && !loading && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
              rows={4}
            />

            <button
              disabled={!textInput.trim()}
              onClick={handleTextSubmit}
              className="w-full bg-primary text-white py-3 rounded-xl disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* Completed */}
        {currentQuestion.type === "complete" && !loading && (
          <button
            onClick={handleComplete}
            className="w-full bg-primary text-white py-3 rounded-xl"
          >
            Continue to Documents
          </button>
        )}
      </div>
    </div>
  );
}
