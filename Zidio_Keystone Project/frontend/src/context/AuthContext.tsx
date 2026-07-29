import { createContext, useContext, useState, ReactNode } from 'react';
import { api, AuthUser } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('keystone_user');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { token, email: userEmail, name, role } = res.data;
    localStorage.setItem('keystone_token', token);
    const authUser: AuthUser = { email: userEmail, name, role };
    localStorage.setItem('keystone_user', JSON.stringify(authUser));
    setUser(authUser);
  }

  function logout() {
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
