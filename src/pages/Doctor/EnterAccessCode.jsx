import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { logAccessEvent } from "../../utils/auditLog";

export default function EnterAccessCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    const cleanCode = code.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Enter the 6-digit code shared by your patient.");
      return;
    }

    const doctorId = auth.currentUser?.uid;

    if (!doctorId) {
      setError("Doctor session expired. Please login again.");
      navigate("/doctor");
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "accessRequests"),
        where("code", "==", cleanCode)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Invalid or unknown access code.");

        await logAccessEvent({
          who: doctorId,
          what: "ACCESS_REQUEST_SUBMITTED",
          why: "Doctor entered patient access code",
          result: "DENIED",
        });

        return;
      }

      const requestDoc = snapshot.docs[0];
      const request = requestDoc.data();

      if (request.status === "REVOKED") {
        setError("This access code has been revoked.");
        return;
      }

      if (
        request.expiresAt &&
        Date.now() >= request.expiresAt
      ) {
        setError("This access code has expired.");
        return;
      }

      if (
        request.doctorId &&
        request.doctorId !== doctorId
      ) {
        setError("This access session is already linked to another doctor.");
        return;
      }

      await updateDoc(
        doc(db, "accessRequests", requestDoc.id),
        {
          status: "ACTIVE",
          doctorId,
          acceptedAt: Date.now(),
        }
      );

      await logAccessEvent({
        who: doctorId,
        what: "PATIENT_ACCESS_GRANTED",
        why: "Doctor accepted patient-shared access code",
        result: "ALLOWED",
      });

      // Go to doctor dashboard, NOT directly to patient queue.
      navigate("/doctor/dashboard");

    } catch (error) {
      console.error("Access code error:", error);

      setError(
        error?.message ||
          "Unable to verify the access code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 font-body">

      <div className="w-full max-w-md bg-surface rounded-2xl border border-gray-100 shadow-sm p-8">

        <div className="text-center mb-7">

          <div className="text-4xl mb-3">
            🔐
          </div>

          <p className="text-primary text-xs font-bold tracking-wide">
            CLINOVA • SECURE ACCESS
          </p>

          <h1 className="font-display text-2xl font-semibold text-text mt-2">
            Add Patient
          </h1>

          <p className="text-text-muted text-sm mt-2 leading-6">
            Enter the 6-digit access code shared by your patient.
          </p>

        </div>

        <label className="block text-sm font-medium text-text mb-2">
          Patient Access Code
        </label>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value.replace(/\D/g, "").slice(0, 6)
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="w-full border border-gray-300 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-primary"
        />

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Access Code"}
        </button>

        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="w-full mt-3 border border-gray-200 text-text py-3 rounded-xl"
        >
          Back to Dashboard
        </button>

      </div>

    </div>
  );
}