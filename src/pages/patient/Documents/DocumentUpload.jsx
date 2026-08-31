import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  extractDocumentInfo,
  explainDocument,
} from "../../../utils/documentExtraction";
import StatusBadge from "../../../components/StatusBadge";

export default function DocumentUpload() {
  const [fileName, setFileName] = useState("");
  const [extracted, setExtracted] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName("");
      setExtracted(null);
      return;
    }

    setFileName(file.name);

    try {
      const result = extractDocumentInfo(file.name);
      setExtracted(result);
    } catch (error) {
      console.error("Document extraction error:", error);

      setExtracted({
        documentType: "Medical Document",
        status: "DRAFT",
        investigations: [],
      });
    }
  };

  const handleVerify = () => {
    if (!extracted) return;

    setExtracted({
      ...extracted,
      status: "VERIFIED",
    });
  };

  const handleContinue = () => {
    if (!extracted || extracted.status !== "VERIFIED") return;

    navigate("/timeline");
  };

  const flagColor = (flag) => {
    if (flag === "High" || flag === "Low") {
      return "text-danger font-semibold";
    }

    if (flag === "Normal") {
      return "text-success";
    }

    return "text-text-muted";
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-bg font-body">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-2xl text-text mb-6">
          Upload Your Medical Documents
        </h1>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="mb-4"
        />

        {fileName && (
          <p className="text-text-muted text-sm">
            Selected: {fileName}
          </p>
        )}

        {extracted && (
          <div className="mt-4 bg-surface rounded-2xl shadow-sm border border-gray-100 p-6">
            <StatusBadge
              status={extracted.status}
              label={
                extracted.status === "DRAFT"
                  ? "AI Draft — Unverified"
                  : "Verified"
              }
            />

            <p className="font-display text-lg text-text mt-4">
              {extracted.documentType}
            </p>

            {extracted.investigations &&
              extracted.investigations.length > 0 && (
                <div className="mt-4 space-y-2">
                  {extracted.investigations.map((inv, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-gray-100 pb-2"
                    >
                      <span className="text-text">
                        {inv.name}
                      </span>

                      <span className={flagColor(inv.flag)}>
                        {inv.value} {inv.unit}{" "}
                        {inv.flag !== "Not clearly identified" &&
                          `(${inv.flag})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            <p className="text-accent text-xs mt-4 italic">
              {explainDocument(extracted)}
            </p>

            {extracted.status === "DRAFT" && (
              <button
                onClick={handleVerify}
                className="mt-4 w-full bg-primary text-white py-2 rounded-xl"
              >
                Confirm This Is Correct
              </button>
            )}
          </div>
        )}

        <button
          disabled={!extracted || extracted.status !== "VERIFIED"}
          onClick={handleContinue}
          className="mt-6 w-full bg-primary text-white py-3 rounded-xl disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
