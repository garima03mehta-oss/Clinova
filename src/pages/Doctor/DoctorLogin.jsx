import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";

export default function DoctorLogin() {
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

      // Firebase Authentication checks the credentials
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const doctorId = result.user.uid;

      // Check doctor profile
      const doctorRef = doc(db, "doctors", doctorId);
      const doctorSnap = await getDoc(doctorRef);

      if (!doctorSnap.exists()) {
        setError(
          "Doctor profile not found. Please register as a doctor first."
        );
        return;
      }

      const doctorData = doctorSnap.data();

      // Store logged-in doctor ID
      localStorage.setItem("clinovaDoctorId", doctorId);

      // Keep verification status available to the app
      localStorage.setItem(
        "clinovaDoctor",
        JSON.stringify({
          doctorId,
          email: doctorData.email || email.trim(),
          verificationStatus:
            doctorData.verificationStatus || "pending",
        })
      );

      // Existing doctor workflow remains unchanged
      navigate("/doctor/enter-code");
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
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
            Doctor Login
          </h1>

          <p className="text-text-muted text-sm mt-2">
            Sign in to access the Clinova doctor portal
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
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-primary"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {error && (
          <p className="text-danger text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <p className="text-text-muted text-sm mt-5 text-center">
          New Doctor?{" "}
          <button
            type="button"
            className="text-primary font-medium"
            onClick={() => navigate("/doctor/register")}
          >
            Create Account
          </button>
        </p>

      </div>
    </div>
  );
}
