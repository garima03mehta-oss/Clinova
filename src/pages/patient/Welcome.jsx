import { useNavigate } from "react-router-dom";
export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body text-center">
      <h1 className="font-display text-3xl font-semibold text-text mb-3">Welcome to Clinova</h1>
      <p className="text-text-muted max-w-sm mb-10">We'll help prepare your medical information before you see the doctor.</p>
      <button onClick={() => navigate("/language")} className="bg-primary text-white font-display text-lg px-10 py-4 rounded-2xl shadow-sm hover:bg-primary-dark transition">
        Start
      </button>
    </div>
  );
}
