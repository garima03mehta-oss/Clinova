import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function PatientRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const patientId = result.user.uid;

      await setDoc(doc(db, "patients", patientId), {
        patientId,
        email: email.trim(),
        loginMethod: "email",
        profileComplete: false,
        createdAt: Date.now(),
      });

      localStorage.setItem("clinovaPatientId", patientId);

      // New patient goes through onboarding once
      navigate("/welcome");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-semibold text-text">
            Patient Registration
          </h1>

          <p className="text-text-muted text-sm mt-2">
            Create your secure Clinova patient account
          </p>
        </div>

        <label className="block text-sm font-medium text-text mb-2">
          Email
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-text mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRegister();
          }}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {error && (
          <p className="text-danger text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <p className="text-text-muted text-sm mt-5 text-center">
          Already have an account?{" "}
          <button
            type="button"
            className="text-primary font-medium"
            onClick={() => navigate("/patient/login")}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}
