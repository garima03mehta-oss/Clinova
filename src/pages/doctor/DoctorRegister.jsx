import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function DoctorRegister() {
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

      const doctorId = result.user.uid;

      // Save doctor profile in Firestore
      await setDoc(doc(db, "doctors", doctorId), {
        doctorId,
        email: email.trim(),
        role: "doctor",
        verificationStatus: "pending",
        createdAt: Date.now(),
      });

      localStorage.setItem("clinovaDoctorId", doctorId);

      // Doctor can continue to the existing access-code workflow
      navigate("/doctor/enter-code");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please login."
        );
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-semibold text-text">
            Doctor Registration
          </h1>

          <p className="text-text-muted text-sm mt-2">
            Create your Clinova doctor account
          </p>
        </div>

        <label className="block text-sm font-medium text-text mb-2">
          Email
        </label>

        <input
          type="email"
          placeholder="doctor@example.com"
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
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-primary"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Doctor Account"}
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
            onClick={() => navigate("/doctor")}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}
