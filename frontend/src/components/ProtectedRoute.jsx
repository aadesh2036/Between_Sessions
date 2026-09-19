import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BetweenLoading from './BetweenLoading';

export default function ProtectedRoute({ children, requireOnboarding = false }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-canvas flex flex-col items-center justify-center">
        <BetweenLoading
          size="lg"
          label="Holding space between sessions..."
          sublabel="Verifying secure cryptographic session"
        />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireOnboarding && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
