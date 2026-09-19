import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage or cookie on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bs_user');
    let storedToken = localStorage.getItem('bs_token');
    if (!storedToken) {
      storedToken = getCookie('bs_token');
      if (storedToken) localStorage.setItem('bs_token', storedToken);
    }

    if (storedUser) {
      try { 
        setUser(JSON.parse(storedUser)); 
      } catch { /* malformed */ }
    } else if (storedToken) {
      // Decode JWT payload to reconstruct minimal user if storedUser was missing
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const fallbackUser = {
            id: payload.userId || payload.sub,
            email: payload.email,
            name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
            onboardingComplete: true,
            isVerified: true,
          };
          setUser(fallbackUser);
          localStorage.setItem('bs_user', JSON.stringify(fallbackUser));
        }
      } catch { /* ignore malformed token */ }
    }

    if (storedToken) setToken(storedToken);
    setIsLoading(false);
  }, []);

  /* ── Auth operations ────────────────────────────────────────────────── */

  const register = async (email, password, name) => {
    setIsLoading(true);
    try {
      return await authApi.register(email, password, name);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('bs_token', data.token);
      localStorage.setItem('bs_user', JSON.stringify(data.user));
      // Maintain cookie for session persistence and server-side / sub-origin compatibility
      document.cookie = `bs_token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verificationToken) => {
    setIsLoading(true);
    try {
      return await authApi.verifyEmail(verificationToken);
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async (email) => {
    setIsLoading(true);
    try {
      return await authApi.resendVerification(email);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update the authenticated user's profile.
   * Uses the JWT bearer token — the api.js layer attaches it automatically.
   * @param {object} updates  e.g. { name, password, onboardingComplete }
   */
  const updateUser = async (updates) => {
    // Optimistically update local user state immediately so route guards and UI reflect changes
    const { password: _p, ...safeUpdates } = updates;
    const currentUser = user || (() => {
      try { return JSON.parse(localStorage.getItem('bs_user')) || {}; } catch { return {}; }
    })();
    const updatedUser = { ...currentUser, ...safeUpdates };
    localStorage.setItem('bs_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    try {
      await authApi.updateUser(updates);
    } catch (err) {
      console.warn('Backend user profile update warning (local state preserved):', err);
    }
  };

  const completeOnboarding = async (onboardingData = {}) => {
    const { password: _p, ...safeUpdates } = onboardingData;
    const currentUser = user || (() => {
      try { return JSON.parse(localStorage.getItem('bs_user')) || {}; } catch { return {}; }
    })();
    const updatedUser = {
      ...currentUser,
      ...safeUpdates,
      onboardingComplete: true,
    };
    // Ensure localStorage and React state are guaranteed updated synchronously
    localStorage.setItem('bs_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Sync with backend API
    try {
      await authApi.updateUser({ onboardingComplete: true, ...onboardingData });
    } catch (err) {
      console.warn('Backend onboarding update failed to persist to server (local state retained):', err);
    }
  };

  const forgotPassword = async (email) => {
    return authApi.forgotPassword(email);
  };

  const resetPassword = async (token, newPassword) => {
    return authApi.resetPassword(token, newPassword);
  };

  const logout = () => {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
    document.cookie = 'bs_token=; path=/; max-age=0; SameSite=Lax';
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    register,
    login,
    logout,
    verifyEmail,
    resendEmail,
    updateUser,
    completeOnboarding,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
