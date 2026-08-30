import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/config";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/doctor/enter-code");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body text-center">
      <h1 className="font-display text-2xl text-text mb-6">Doctor Login</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 w-full max-w-sm mb-3" />
      <button onClick={handleLogin} className="bg-primary text-white py-3 rounded-xl w-full max-w-sm">Login</button>
      {error && <p className="text-danger text-sm mt-3">{error}</p>}
      <p className="text-text-muted text-sm mt-4">
        New Doctor? <span className="text-primary cursor-pointer" onClick={() => navigate("/doctor/register")}>Register</span>
      </p>
      <button onClick={() => navigate("/doctor/emergency")} className="mt-6 text-danger text-sm">🚨 Emergency Access</button>
    </div>
  );
}