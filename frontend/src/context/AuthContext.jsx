import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('bs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email) => {
    setIsLoading(true);
    // Simulate network delay and rate limiting
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          setIsLoading(false);
          return reject(new Error("Invalid email format"));
        }
        
        // Simulate email verification flow
        const mockUser = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          onboardingComplete: false
        };
        
        localStorage.setItem('bs_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsLoading(false);
        resolve(mockUser);
      }, 1500);
    });
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboardingComplete: true };
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('bs_user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
