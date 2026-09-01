import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      // Firebase Authentication
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const patientId = result.user.uid;

      console.log("Firebase login successful:", patientId);

      // Get patient profile from Firestore
      const patientRef = doc(db, "patients", patientId);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists()) {
        setError(
          "Login successful, but patient profile was not found. Please contact support."
        );
        return;
      }

      const patientData = patientSnap.data();

      console.log("Patient profile loaded:", patientData);

      // Save patient ID
      localStorage.setItem("clinovaPatientId", patientId);

      // Save patient profile locally
      localStorage.setItem(
        "clinovaPatient",
        JSON.stringify({
          name: patientData.name || "",
          age: patientData.age || "",
          phone: patientData.phone || "",
        })
      );

      // Save profile completion status
      localStorage.setItem(
        "clinovaProfileComplete",
        patientData.profileComplete === true ? "true" : "false"
      );

      // Every patient goes through language selection
      navigate("/language");

    } catch (err) {
      // Show exact Firebase error in browser console
      console.error("========== FIREBASE LOGIN ERROR ==========");
      console.error("Error Code:", err?.code);
      console.error("Error Message:", err?.message);
      console.error("Full Error:", err);
      console.error("==========================================");

      // User-friendly messages
      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many login attempts. Please try again later.");
      } else if (err?.code === "auth/operation-not-allowed") {
        setError(
          "Email/Password login is disabled in Firebase Authentication."
        );
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err?.message || "Login failed. Please try again."
        );
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
            Patient Login
          </h1>

          <p className="text-text-muted text-sm mt-2">
            Sign in to access your Clinova health dashboard
          </p>
        </div>

        {/* Email */}
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

        {/* Password */}
        <label className="block text-sm font-medium text-text mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-danger text-sm mt-4 text-center">
            {error}
          </p>
        )}

        {/* Register */}
        <p className="text-text-muted text-sm mt-5 text-center">
          New Patient?{" "}
          <button
            type="button"
            className="text-primary font-medium"
            onClick={() => navigate("/patient/register")}
          >
            Create Account
          </button>
        </p>

      </div>
    </div>
  );
}
