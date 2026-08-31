import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function Identification() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadPatientProfile = async () => {
      try {
        const patientId = localStorage.getItem("clinovaPatientId");

        if (!patientId) {
          navigate("/patient/login");
          return;
        }

        const patientRef = doc(db, "patients", patientId);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const data = patientSnap.data();

          // Profile already complete → don't ask again
          if (data.profileComplete === true) {
            localStorage.setItem(
              "clinovaPatient",
              JSON.stringify({
                name: data.name || "",
                age: data.age || "",
                phone: data.phone || "",
              })
            );

            navigate("/patient/dashboard");
            return;
          }

          // Pre-fill existing data if available
          setName(data.name || "");
          setAge(data.age || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatientProfile();
  }, [navigate]);

  const handleContinue = async () => {
    setError("");

    if (!name.trim() || !age) {
      setError("Please enter your name and age.");
      return;
    }

    try {
      setSaving(true);

      const patientId = localStorage.getItem("clinovaPatientId");

      if (!patientId) {
        navigate("/patient/login");
        return;
      }

      const patientRef = doc(db, "patients", patientId);

      // Save permanently in Firestore
      await setDoc(
        patientRef,
        {
          patientId,
          name: name.trim(),
          age: Number(age),
          phone: phone.trim(),
          profileComplete: true,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // Also keep locally for dashboard greeting
      localStorage.setItem(
        "clinovaPatient",
        JSON.stringify({
          name: name.trim(),
          age: Number(age),
          phone: phone.trim(),
        })
      );

      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-body">
        <p className="text-text-muted">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-semibold text-text">
            Tell us about yourself
          </h1>

          <p className="text-text-muted text-sm mt-2">
            We only need these details once to create your patient profile.
          </p>
        </div>

        <label className="block text-sm font-medium text-text mb-2">
          Full Name
        </label>

        <input
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-text mb-2">
          Age
        </label>

        <input
          type="number"
          min="1"
          max="120"
          placeholder="Your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-text mb-2">
          Phone Number
        </label>

        <input
          type="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-primary"
        />

        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>

        {error && (
          <p className="text-danger text-sm mt-4 text-center">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}
