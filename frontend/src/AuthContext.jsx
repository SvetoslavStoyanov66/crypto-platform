import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true
      });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt', token);
    setAuthState({
      token,
      isAuthenticated: true
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setAuthState({
      token: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};