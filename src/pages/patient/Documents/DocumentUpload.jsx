import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  extractDocumentInfo,
  explainDocument
} from "../../../utils/documentExtraction";
export default function DocumentUpload() {
  const [fileName, setFileName] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setExtracted(extractDocumentInfo(file.name));
    }
  };

  const handleVerify = () => {
    setExtracted({ ...extracted, status: "VERIFIED" });
  };

  const handleContinue = () => {
    navigate("/timeline");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Upload Your Medical Documents</h1>
      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      {fileName && <p>Selected: {fileName}</p>}
      {extracted && (
        <div>
          <p style={{ color: extracted.status === "DRAFT" ? "orange" : "green" }}>
            Status: {extracted.status === "DRAFT" ? "AI Draft — Unverified" : "Verified"}
          </p>
          <p>Type: {extracted.documentType}</p>
          <p>Date: {extracted.date}</p>
          <p>Hospital: {extracted.hospital}</p>
          <p style={{ fontSize: "12px", color: "gray" }}>{explainDocument(extracted)}</p>
          {extracted.status === "DRAFT" && <button onClick={handleVerify}>Confirm This Is Correct</button>}
        </div>
      )}
      <br />
      <button disabled={!extracted || extracted.status !== "VERIFIED"} onClick={handleContinue}>Continue</button>
    </div>
  );
}