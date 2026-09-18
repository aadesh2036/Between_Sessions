import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './pages/OnboardingFlow';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import PracticeHistoryPage from './pages/PracticeHistoryPage';
import ClinicianConnectPage from './pages/ClinicianConnectPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Onboarding */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected App Routes */}
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute requireOnboarding={true}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="practice" element={<PracticeHistoryPage />} />
                  <Route path="clinician" element={<ClinicianConnectPage />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
