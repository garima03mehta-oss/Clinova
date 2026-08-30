
import { useNavigate } from "react-router-dom";
export default function Language() {
  const navigate = useNavigate();
  const selectLanguage = (lang) => {
    localStorage.setItem("clinovaLanguage", lang);
    navigate("/consent");
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Choose Your Language</h1>
      <button onClick={() => selectLanguage("hindi")} style={{ margin: "10px" }}>हिंदी</button>
      <button onClick={() => selectLanguage("english")} style={{ margin: "10px" }}>English</button>
    </div>
  );
}