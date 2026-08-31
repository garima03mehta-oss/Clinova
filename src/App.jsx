import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import PatientLogin from "./pages/patient/PatientLogin";
import Welcome from "./pages/patient/Welcome";
import Language from "./pages/patient/Language";
import Consent from "./pages/patient/Consent";
import Identification from "./pages/patient/Identification";
import CareSystemSelection from "./pages/patient/CareSystemSelection";
import Interview from "./pages/patient/interview/Interview";
import DocumentUpload from "./pages/patient/documents/DocumentUpload";
import Timeline from "./pages/patient/documents/Timeline";
import HealthRecord from "./pages/patient/HealthRecord";
import RecordSearch from "./pages/patient/RecordSearch";
import ShareConsent from "./pages/patient/ShareConsent";
import ShareAccess from "./pages/patient/ShareAccess";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import EnterAccessCode from "./pages/doctor/EnterAccessCode";
import PatientQueue from "./pages/doctor/PatientQueue";
import AttentionLayer from "./pages/doctor/AttentionLayer";
import ClinicalSummary from "./pages/doctor/ClinicalSummary";
import DoctorVerification from "./pages/doctor/DoctorVerification";
import PatientRegister from "./pages/patient/PatientRegister";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import EmergencyAccess from "./pages/doctor/EmergencyAccess";
import AuditLog from "./pages/doctor/AuditLog";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />

        <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/register" element={<PatientRegister />} />

        <Route path="/welcome" element={<Welcome />} />
        <Route path="/language" element={<Language />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/identification" element={<Identification />} />
        <Route path="/care-system" element={<CareSystemSelection />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/documents" element={<DocumentUpload />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/health-record" element={<HealthRecord />} />
        <Route path="/search" element={<RecordSearch />} />
        <Route path="/share-consent" element={<ShareConsent />} />
        <Route path="/share-access" element={<ShareAccess />} />

        <Route path="/doctor" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        <Route path="/doctor/enter-code" element={<EnterAccessCode />} />
        <Route path="/doctor/queue" element={<PatientQueue />} />
        <Route path="/doctor/attention" element={<AttentionLayer />} />
        <Route path="/doctor/summary" element={<ClinicalSummary />} />
        <Route path="/doctor/verification" element={<DoctorVerification />} />
        <Route path="/doctor/emergency" element={<EmergencyAccess />} />
        <Route path="/doctor/audit-log" element={<AuditLog />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;