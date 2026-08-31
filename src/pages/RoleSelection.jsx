import { useNavigate } from "react-router-dom";
export default function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg font-body">
      <h1 className="font-display text-4xl font-semibold text-text mb-2">Clinova</h1>
      <p className="text-text-muted mb-12">Your Complete Digital Health Record</p>
      <p className="font-display text-lg text-text mb-6">Who are you?</p>
      <div className="flex gap-4 w-full max-w-sm">
        <button onClick={() => navigate("/patient/login")} className="flex-1 bg-primary text-white font-display text-lg py-5 rounded-2xl shadow-sm hover:bg-primary-dark transition">
          👤 Patient
        </button>
        <button onClick={() => navigate("/doctor")} className="flex-1 bg-surface border-2 border-primary text-primary font-display text-lg py-5 rounded-2xl shadow-sm hover:bg-primary-light transition">
          👨‍⚕️ Doctor
        </button>
      </div>
    </div>
  );
}