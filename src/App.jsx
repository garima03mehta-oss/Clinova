import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";

import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorPatientRecord from "./pages/doctor/DoctorPatientRecord";
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

import PreReport from "./pages/patient/PreReport";

import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import EnterAccessCode from "./pages/doctor/EnterAccessCode";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientQueue from "./pages/doctor/PatientQueue";
import AttentionLayer from "./pages/doctor/AttentionLayer";
import ClinicalSummary from "./pages/doctor/ClinicalSummary";
import DoctorVerification from "./pages/doctor/DoctorVerification";
import EmergencyAccess from "./pages/doctor/EmergencyAccess";
import AuditLog from "./pages/doctor/AuditLog";
import PatientWorkspace from "./pages/doctor/PatientWorkspace";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            ROOT
        ========================= */}

        <Route
          path="/"
          element={<RoleSelection />}
        />

        {/* =========================
            PATIENT AUTH
        ========================= */}

        <Route
          path="/patient/login"
          element={<PatientLogin />}
        />
<Route
  path="/doctor/patient/:patientId"
  element={<DoctorPatientRecord />}
/>
<Route
  path="/doctor/patient"
  element={<PatientWorkspace />}
/>
        <Route
          path="/patient/register"
          element={<PatientRegister />}
        />

        {/* =========================
            PATIENT DASHBOARD
        ========================= */}

        <Route
          path="/patient/dashboard"
          element={<PatientDashboard />}
        />

        {/* Backward-compatible route.
            Prevents white screen if any older
            component still navigates to /patient.
        */}
        <Route
          path="/patient"
          element={<PatientDashboard />}
        />

        {/* =========================
            PATIENT FLOW
        ========================= */}

        <Route
          path="/welcome"
          element={<Welcome />}
        />

        <Route
          path="/language"
          element={<Language />}
        />

        <Route
          path="/consent"
          element={<Consent />}
        />

        <Route
          path="/identification"
          element={<Identification />}
        />

        <Route
          path="/care-system"
          element={<CareSystemSelection />}
        />

        <Route
          path="/interview"
          element={<Interview />}
        />

        {/* =========================
            DOCUMENTS
        ========================= */}

        <Route
          path="/documents"
          element={<DocumentUpload />}
        />

        {/* =========================
            MEDICAL RECORD
        ========================= */}

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        <Route
          path="/health-record"
          element={<HealthRecord />}
        />

        <Route
          path="/search"
          element={<RecordSearch />}
        />

        {/* =========================
            SHARING
        ========================= */}

        <Route
          path="/share-consent"
          element={<ShareConsent />}
        />

        <Route
          path="/share-access"
          element={<ShareAccess />}
        />

        {/* =========================
            PRE-REPORT
        ========================= */}

        <Route
          path="/pre-report"
          element={<PreReport />}
        />

        {/* =========================
            DOCTOR
        ========================= */}

        <Route
          path="/doctor"
          element={<DoctorLogin />}
        />

        <Route
          path="/doctor/register"
          element={<DoctorRegister />}
        />

        <Route
          path="/doctor/enter-code"
          element={<EnterAccessCode />}
        />
        <Route
          path="/doctor/dashboard"
          element={<DoctorDashboard />}
        />
        <Route
          path="/doctor/queue"
          element={<PatientQueue />}
        />

        <Route
          path="/doctor/attention"
          element={<AttentionLayer />}
        />

        <Route
          path="/doctor/summary"
          element={<ClinicalSummary />}
        />

        <Route
          path="/doctor/verification"
          element={<DoctorVerification />}
        />

        <Route
          path="/doctor/emergency"
          element={<EmergencyAccess />}
        />

        <Route
          path="/doctor/audit-log"
          element={<AuditLog />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;