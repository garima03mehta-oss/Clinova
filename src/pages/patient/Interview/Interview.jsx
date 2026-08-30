import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompletenessScore } from "../../../utils/completenessScore";
import { checkPriority } from "../../../utils/priorityEngine";

export default function Interview() {
  const navigate = useNavigate();

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priorityAlert, setPriorityAlert] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState({
    type: "text",
    question: "What symptoms are you facing?",
    key: "chiefComplaint",
  });

  const completeness = getCompletenessScore({
    chiefComplaint,
    hpi: Object.values(answers).join(" "),
    adaptiveAnswers: answers,
  });

  // Ask Gemini for the next relevant question
  const askGemini = async (latestAnswer, history) => {
    setLoading(true);
    setSelectedAnswer(null);

    try {
      const response = await fetch("/api/getAdaptiveQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText: latestAnswer,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get adaptive question");
      }

      const data = await response.json();

      console.log("Gemini response:", data);

      if (data.chiefComplaint && !chiefComplaint) {
        setChiefComplaint(data.chiefComplaint);
      }

      if (
        Array.isArray(data.followUpQuestions) &&
        data.followUpQuestions.length > 0
      ) {
        const nextQuestion = data.followUpQuestions[0];

        setCurrentQuestion({
          type: nextQuestion.type || "text",
          question: nextQuestion.question,
          key: nextQuestion.key,
        });

        return;
      }

      // Gemini says enough information has been collected
      setCurrentQuestion({
        type: "complete",
        question:
          "Thank you. We have collected enough information for the initial history.",
      });
    } catch (error) {
      console.error("Gemini error:", error);

      // Do NOT repeatedly ask "provide more information".
      // Instead, finish the interview if Gemini/API fails.
      setCurrentQuestion({
        type: "complete",
        question:
          "We have collected the available information for the initial history.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Select Yes/No answer
  const handleYesNoSelect = (value) => {
    setSelectedAnswer(value);
  };

  // Continue after Yes/No question
  const handleYesNoContinue = async () => {
    if (selectedAnswer === null || loading) {
      return;
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: selectedAnswer,
    };

    setAnswers(updatedAnswers);

    const priority = checkPriority({
      chestPain:
        chiefComplaint.toLowerCase().includes("chest pain"),
      ...updatedAnswers,
    });

    if (priority.flagged) {
      setPriorityAlert(priority.reason);
    }

    await askGemini(
      String(selectedAnswer),
      {
        chiefComplaint,
        ...updatedAnswers,
      }
    );
  };

  // Continue after text question
  const handleTextSubmit = async () => {
    const answer = textInput.trim();

    if (!answer || loading) {
      return;
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: answer,
    };

    setAnswers(updatedAnswers);
    setTextInput("");

    // First answer = main complaint
    if (!chiefComplaint) {
      setChiefComplaint(answer);

      await askGemini(answer, {
        chiefComplaint: answer,
        ...updatedAnswers,
      });

      return;
    }

    // Send latest answer + complete history to Gemini
    await askGemini(answer, {
      chiefComplaint,
      ...updatedAnswers,
    });
  };

  // Finish interview
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

        {/* Priority Alert */}
        {priorityAlert && (
          <div className="bg-red-50 border border-danger rounded-xl p-3 mb-4">
            <p className="text-danger text-sm font-medium">
              ⚠ {priorityAlert}
            </p>
          </div>
        )}

        {/* Current Question */}
        <p className="font-display text-xl text-text mb-6">
          {currentQuestion.question}
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-sm text-text-muted">
              Preparing your next question...
            </p>
          </div>
        )}

        {/* TEXT QUESTION */}
        {!loading && currentQuestion.type === "text" && (
          <div>
            <textarea
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Type your answer here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
              rows={4}
            />

            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* YES / NO QUESTION */}
        {!loading && currentQuestion.type === "yesno" && (
          <div>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
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
                type="button"
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
              type="button"
              onClick={handleYesNoContinue}
              disabled={selectedAnswer === null}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* COMPLETE */}
        {!loading && currentQuestion.type === "complete" && (
          <button
            type="button"
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