import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuth({ accessToken: token });
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem('accessToken');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    setAuth({ accessToken });
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAuth(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
