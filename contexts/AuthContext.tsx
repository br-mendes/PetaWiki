import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const savedSession = localStorage.getItem('peta_wiki_session');
      if (savedSession) {
        try {
          const { user } = JSON.parse(savedSession);
          if (user) {
            const normalizedUser = {
              ...user,
              role: (user.role || '').toUpperCase()
            };
            setCurrentUser(normalizedUser);
          }
        } catch (e) {
          localStorage.removeItem('peta_wiki_session');
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !data || data.password !== password) {
      return false;
    }

    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      department: data.department,
      avatar: data.avatar,
      themePreference: data.theme_preference,
      isSuperAdmin: data.is_super_admin,
    };

    setCurrentUser(user);
    localStorage.setItem('peta_wiki_session', JSON.stringify({ user, lastActive: Date.now() }));
    return true;
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('peta_wiki_session');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
