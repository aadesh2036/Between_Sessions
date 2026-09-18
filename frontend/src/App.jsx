import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './pages/OnboardingFlow';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import PracticeHistoryPage from './pages/PracticeHistoryPage';
import ClinicianConnectPage from './pages/ClinicianConnectPage';
import PractitionerDashboardPage from './pages/PractitionerDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Practitioner auth + dashboard — no AuthProvider gatekeeping needed,
              the page itself checks localStorage for bs_prac_token */}
          <Route path="/practitioner/login" element={<LoginPage practitionerMode />} />
          <Route path="/practitioner/*" element={<PractitionerDashboardPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingFlow /></ProtectedRoute>
          } />

          {/* User app */}
          <Route path="/app/*" element={
            <ProtectedRoute requireOnboarding={true}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="practice" element={<PracticeHistoryPage />} />
                <Route path="clinician" element={<ClinicianConnectPage />} />
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
