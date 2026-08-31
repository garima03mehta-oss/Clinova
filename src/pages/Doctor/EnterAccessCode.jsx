import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { logAccessEvent } from "../../utils/auditLog";

export default function EnterAccessCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code your patient shared with you.");
      return;
    }
    const doctorId = auth.currentUser?.uid;
    const q = query(collection(db, "accessRequests"), where("code", "==", code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      setError("Invalid or unknown code.");
      logAccessEvent({ who: doctorId, what: "ACCESS_REQUEST_SUBMITTED", why: "Doctor entered patient code", result: "DENIED" });
      return;
    }

    const requestDoc = snapshot.docs[0];
    const request = requestDoc.data();

    if (request.status === "REVOKED" || Date.now() >= request.expiresAt) {
      setError("This access code is invalid or expired.");
      logAccessEvent({ who: doctorId, what: "ACCESS_REQUEST_SUBMITTED", why: "Doctor entered patient code", result: "DENIED" });
      return;
    }

    await updateDoc(doc(db, "accessRequests", requestDoc.id), { status: "ACTIVE", doctorId });
    logAccessEvent({ who: doctorId, what: "ACCESS_REQUEST_SUBMITTED", why: "Doctor entered patient code", result: "ALLOWED" });
    navigate("/doctor/queue");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Enter Patient Access Code</h1>
      <p>Ask your patient for the 6-digit code they generated in Clinova.</p>
      <input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
      <br /><br />
      <button onClick={handleSubmit}>Submit</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}