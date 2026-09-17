import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('bs_user');
    const storedToken = localStorage.getItem('bs_token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = 'Verification failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { token, user } = data;

      localStorage.setItem('bs_token', token);
      localStorage.setItem('bs_user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboardingComplete: true };
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
    user,
    token,
    isLoading,
    login,
    logout,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
