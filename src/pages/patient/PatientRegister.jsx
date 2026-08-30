import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function PatientRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const patientId = result.user.uid;

      await setDoc(doc(db, "patients", patientId), {
        patientId,
        email,
        loginMethod: "email",
        createdAt: Date.now(),
      });

      localStorage.setItem("clinovaPatientId", patientId);

      navigate("/welcome");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        
        <h1 className="font-display text-2xl text-text mb-6">
          Patient Registration
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-primary text-white py-3 rounded-xl"
        >
          Register
        </button>

        {error && (
          <p className="text-danger text-sm mt-3">
            {error}
          </p>
        )}

        <p className="text-text-muted text-sm mt-4">
          Already have an account?{" "}
          <span
            className="text-primary cursor-pointer"
            onClick={() => navigate("/patient/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}