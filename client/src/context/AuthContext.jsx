import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        try {
          const validUser = await authService.getMe(parsedUser.token);
          setUser({ ...validUser, token: parsedUser.token });
        } catch (error) {
          console.error('Session expired or invalid');
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginCustomer = async (data) => {
    const res = await authService.loginCustomer(data);
    setUser(res);
  };

  const registerCustomer = async (data) => {
    const res = await authService.registerCustomer(data);
    setUser(res);
  };

  const loginWorker = async (data) => {
    const res = await authService.loginWorker(data);
    setUser(res);
  };

  const registerWorker = async (data) => {
    const res = await authService.registerWorker(data);
    setUser(res);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCustomer, registerCustomer, loginWorker, registerWorker, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
