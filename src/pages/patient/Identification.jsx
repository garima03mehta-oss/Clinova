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

  const language =
    localStorage.getItem("clinovaLanguage") || "english";

  const isHindi = language === "hindi";

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
      setError(
        isHindi
          ? "कृपया अपना नाम और उम्र दर्ज करें।"
          : "Please enter your name and age."
      );
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
        <p className="text-text-muted">
          {isHindi
            ? "आपकी प्रोफ़ाइल लोड हो रही है..."
            : "Loading your profile..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg font-body">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-semibold text-text">
            {isHindi
              ? "अपने बारे में बताएं"
              : "Tell us about yourself"}
          </h1>

          <p className="text-text-muted text-sm mt-2">
            {isHindi
              ? "आपको ये जानकारी केवल एक बार देनी होगी।"
              : "We only need these details once to create your patient profile."}
          </p>
        </div>

        <label className="block text-sm font-medium text-text mb-2">
          {isHindi ? "पूरा नाम" : "Full Name"}
        </label>

        <input
          placeholder={isHindi ? "अपना पूरा नाम" : "Your full name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-text mb-2">
          {isHindi ? "उम्र" : "Age"}
        </label>

        <input
          type="number"
          min="1"
          max="120"
          placeholder={isHindi ? "अपनी उम्र" : "Your age"}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-text mb-2">
          {isHindi ? "फ़ोन नंबर" : "Phone Number"}
        </label>

        <input
          type="tel"
          placeholder={
            isHindi ? "अपना फ़ोन नंबर" : "Your phone number"
          }
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 outline-none focus:border-primary"
        />

        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
        >
          {saving
            ? isHindi
              ? "सेव हो रहा है..."
              : "Saving..."
            : isHindi
            ? "सेव करें और जारी रखें"
            : "Save & Continue"}
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
