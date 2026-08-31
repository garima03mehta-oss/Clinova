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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Doctor Login</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <br /><br />
      <button onClick={() => navigate("/doctor/emergency")} style={{ color: "red" }}>🚨 Emergency Access</button>
    </div>
  );
}
