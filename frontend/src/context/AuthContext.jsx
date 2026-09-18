import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('bs_user');
    const storedToken = localStorage.getItem('bs_token');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
    setIsLoading(false);
  }, []);

  const _fetch = async (endpoint, body) => {
    const res = await fetch(`http://localhost:3000/api/v1${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    try {
      return await _fetch('/auth/register', { email, password, name });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await _fetch('/auth/login', { email, password });
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
      return await _fetch('/auth/verify', { token: verificationToken });
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async (email) => {
    setIsLoading(true);
    try {
      return await _fetch('/auth/resend', { email });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (email, updates) => {
    setIsLoading(true);
    try {
      await _fetch('/user/update', { email, ...updates });
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (user) {
      const updatedUser = { ...user, onboardingComplete: true };
      await updateUser(user.email, { onboardingComplete: true });
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user, token, isLoading,
    register, login, logout, verifyEmail, resendEmail, updateUser, completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
