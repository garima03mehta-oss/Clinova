import { BrowserRouter, Routes, Route } from "react-router-dom";

// ========================================
// ROOT
// ========================================
import RoleSelection from "./pages/RoleSelection";

// ========================================
// PATIENT
// ========================================
import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";

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

// ========================================
// DOCTOR
// ========================================
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
import DoctorPatientRecord from "./pages/doctor/DoctorPatientRecord";

import HealthTrends from "./pages/doctor/HealthTrends";

// ========================================
// DOCTOR BILLING
// ========================================
import BillingDashboard from "./pages/doctor/billing/BillingDashboard";
import CreateBill from "./pages/doctor/billing/CreateBill";
import BillDetails from "./pages/doctor/billing/BillDetails";
import ExpenseManagement from "./pages/doctor/billing/ExpenseManagement";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ========================================
            ROOT
        ======================================== */}

        <Route
          path="/"
          element={<RoleSelection />}
        />


        {/* ========================================
            PATIENT AUTH
        ======================================== */}

        <Route
          path="/patient/login"
          element={<PatientLogin />}
        />

        <Route
          path="/patient/register"
          element={<PatientRegister />}
        />


        {/* ========================================
            PATIENT DASHBOARD
        ======================================== */}

        <Route
          path="/patient/dashboard"
          element={<PatientDashboard />}
        />

        {/* Backward compatibility */}
        <Route
          path="/patient"
          element={<PatientDashboard />}
        />


        {/* ========================================
            PATIENT ONBOARDING
        ======================================== */}

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


        {/* ========================================
            PATIENT DOCUMENTS
        ======================================== */}

        <Route
          path="/documents"
          element={<DocumentUpload />}
        />


        {/* ========================================
            PATIENT MEDICAL RECORD
        ======================================== */}

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


        {/* ========================================
            PATIENT SHARING
        ======================================== */}

        <Route
          path="/share-consent"
          element={<ShareConsent />}
        />

        <Route
          path="/share-access"
          element={<ShareAccess />}
        />


        {/* ========================================
            PRE-REPORT
        ======================================== */}

        <Route
          path="/pre-report"
          element={<PreReport />}
        />


        {/* ========================================
            DOCTOR LOGIN
        ======================================== */}

        <Route
          path="/doctor"
          element={<DoctorLogin />}
        />

        <Route
          path="/doctor/register"
          element={<DoctorRegister />}
        />


        {/* ========================================
            DOCTOR ACCESS CODE
        ======================================== */}

        <Route
          path="/doctor/enter-code"
          element={<EnterAccessCode />}
        />


        {/* ========================================
            DOCTOR DASHBOARD
        ======================================== */}

        <Route
          path="/doctor/dashboard"
          element={<DoctorDashboard />}
        />


        {/* ========================================
            DOCTOR PATIENT QUEUE
        ======================================== */}

        <Route
          path="/doctor/queue"
          element={<PatientQueue />}
        />


        {/* ========================================
            PATIENT WORKSPACE
        ======================================== */}

        {/* Existing route */}
        <Route
          path="/doctor/patient"
          element={<PatientWorkspace />}
        />

        {/* Dashboard workspace route */}
        <Route
          path="/doctor/patient-workspace"
          element={<PatientWorkspace />}
        />

        {/* Patient-specific record */}
        <Route
          path="/doctor/patient/:patientId"
          element={<DoctorPatientRecord />}
        />


        {/* ========================================
            DOCTOR ATTENTION LAYER
        ======================================== */}

        <Route
          path="/doctor/attention"
          element={<AttentionLayer />}
        />


        {/* ========================================
            CLINICAL SUMMARY
        ======================================== */}

        {/* Existing route */}
        <Route
          path="/doctor/summary"
          element={<ClinicalSummary />}
        />

        {/* IMPORTANT:
            This matches the route used by your
            Doctor Dashboard.
        */}
        <Route
          path="/doctor/clinical-summary"
          element={<ClinicalSummary />}
        />


        {/* ========================================
            DOCTOR VERIFICATION
        ======================================== */}

        <Route
          path="/doctor/verification"
          element={<DoctorVerification />}
        />


        {/* ========================================
            EMERGENCY ACCESS
        ======================================== */}

        <Route
          path="/doctor/emergency"
          element={<EmergencyAccess />}
        />


        {/* ========================================
            AUDIT LOG
        ======================================== */}

        <Route
          path="/doctor/audit-log"
          element={<AuditLog />}
        />


        {/* ========================================
            HEALTH TRENDS
        ======================================== */}

        <Route
          path="/doctor/health-trends"
          element={<HealthTrends />}
        />


        {/* ========================================
            BILLING
        ======================================== */}

        <Route
          path="/doctor/billing"
          element={<BillingDashboard />}
        />

        <Route
          path="/doctor/billing/create"
          element={<CreateBill />}
        />

        <Route
          path="/doctor/billing/expenses"
          element={<ExpenseManagement />}
        />

        <Route
          path="/doctor/billing/:billId"
          element={<BillDetails />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;