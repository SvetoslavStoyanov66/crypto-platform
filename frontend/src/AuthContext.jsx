import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    isAuthenticated: false,
    user: null,
    loading: true,  
    error: null
  });

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setAuthState(prev => ({
        ...prev,
        token,
        isAuthenticated: true,
        loading: true
      }));
      fetchUser(token); 
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAuthState(prev => ({
        ...prev,
        user: response.data,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setAuthState(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch user data'
      }));
    }
  };

  const login = async (token) => {
    localStorage.setItem('jwt', token);
    setAuthState(prev => ({
      ...prev,
      token,
      isAuthenticated: true,
      loading: true
    }));
    await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
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