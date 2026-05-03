import { createContext, useState, useEffect } from 'react';
import api from '../lib/api';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/api/users/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/users/login', { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/api/users/register', { username, email, password });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post('/api/users/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
