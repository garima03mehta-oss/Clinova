import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/config";

export default function PatientLogin() {
  const [method, setMethod] = useState(null);
  const [abhaId, setAbhaId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidAbhaFormat = (id) => /^\d{2}-\d{4}-\d{4}-\d{4}$/.test(id);

  const handleAbhaContinue = async () => {
    if (!isValidAbhaFormat(abhaId)) {
      setError("Enter a valid ABHA ID in the format XX-XXXX-XXXX-XXXX");
      return;
    }
    await setDoc(doc(db, "patients", abhaId), { patientId: abhaId, loginMethod: "abha", createdAt: Date.now() }, { merge: true });
    localStorage.setItem("clinovaPatientId", abhaId);
    navigate("/welcome");
  };

  const handlePhoneContinue = async () => {
    if (!phone) {
      setError("Enter your phone number");
      return;
    }
    await setDoc(doc(db, "patients", phone), { patientId: phone, loginMethod: "phone", createdAt: Date.now() }, { merge: true });
    localStorage.setItem("clinovaPatientId", phone);
    navigate("/welcome");
  };

  const handleEmailContinue = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("clinovaPatientId", result.user.uid);
      navigate("/welcome");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!method) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
        <h1 className="font-display text-2xl text-text mb-6">Patient Login</h1>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={() => setMethod("abha")} className="bg-primary text-white py-3 rounded-xl">Login with ABHA ID</button>
          <button onClick={() => setMethod("phone")} className="bg-surface border-2 border-primary text-primary py-3 rounded-xl">Continue with Phone Number</button>
          <button onClick={() => setMethod("email")} className="bg-surface border-2 border-gray-300 text-text-muted py-3 rounded-xl">Continue with Email</button>
        </div>
        <p className="text-text-muted text-sm mt-6">
          New Patient? <span className="text-primary cursor-pointer" onClick={() => navigate("/patient/register")}>Register</span>
        </p>
      </div>
    );
  }

  if (method === "abha") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body text-center">
        <h1 className="font-display text-2xl text-text mb-2">Login with ABHA ID</h1>
        <p className="text-text-muted text-xs mb-4">ABDM-readiness simulation — not connected to live ABHA verification.</p>
        <input placeholder="XX-XXXX-XXXX-XXXX" value={abhaId} onChange={(e) => setAbhaId(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
        <button onClick={handleAbhaContinue} className="bg-primary text-white py-3 rounded-xl w-full max-w-sm">Continue</button>
        {error && <p className="text-danger text-sm mt-3">{error}</p>}
      </div>
    );
  }

  if (method === "phone") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body text-center">
        <h1 className="font-display text-2xl text-text mb-4">Continue with Phone Number</h1>
        <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
        <button onClick={handlePhoneContinue} className="bg-primary text-white py-3 rounded-xl w-full max-w-sm">Continue</button>
        {error && <p className="text-danger text-sm mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body text-center">
      <h1 className="font-display text-2xl text-text mb-4">Continue with Email</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
      <button onClick={handleEmailContinue} className="bg-primary text-white py-3 rounded-xl w-full max-w-sm">Continue</button>
      {error && <p className="text-danger text-sm mt-3">{error}</p>}
    </div>
  );
}
