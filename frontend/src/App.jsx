import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PractitionerProtectedRoute from './components/PractitionerProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './pages/OnboardingFlow';
import DashboardPage from './pages/DashboardPage';
import PracticePage from './pages/PracticePage';
import ToolkitPage from './pages/ToolkitPage';
import LearnPage from './pages/LearnPage';
import CarePage from './pages/CarePage';
import SettingsPage from './pages/SettingsPage';
import PractitionerDashboardPage from './pages/PractitionerDashboardPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsPage defaultTab="terms" />} />
          <Route path="/privacy" element={<TermsPage defaultTab="privacy" />} />

          {/* Practitioner auth + protected dashboard */}
          <Route path="/practitioner/login" element={<LoginPage practitionerMode />} />
          <Route
            path="/practitioner/*"
            element={
              <PractitionerProtectedRoute>
                <PractitionerDashboardPage />
              </PractitionerProtectedRoute>
            }
          />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingFlow /></ProtectedRoute>
          } />

          {/* User app — 5 Pillars */}
          <Route path="/app/*" element={
            <ProtectedRoute requireOnboarding={true}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="practice" element={<PracticePage />} />
                <Route path="toolkit" element={<ToolkitPage />} />
                <Route path="learn" element={<LearnPage />} />
                <Route path="care" element={<CarePage />} />
                <Route path="clinician" element={<Navigate to="/app/care" replace />} />
                <Route path="settings" element={<SettingsPage />} />
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
