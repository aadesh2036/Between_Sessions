import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('bs_user');
    const storedToken = localStorage.getItem('bs_token');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* malformed */ }
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
    setIsLoading(true);
    try {
      await authApi.updateUser(updates);
      // Reflect non-sensitive changes in local state
      const { password: _p, ...safeUpdates } = updates;
      const updatedUser = { ...user, ...safeUpdates };
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (user) {
      await updateUser({ onboardingComplete: true });
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
