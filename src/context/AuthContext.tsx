import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/authGoogle';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

interface GooglePayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  organization?: string;
  telephone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUser = useCallback(async (email: string): Promise<User | null> => {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (queryError) throw queryError;
      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name || 'Usuário',
        photo: data.photo,
        organization: data.organization,
        telephone: data.telephone
      };
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }, []);

  const login = useCallback(async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      if (!userData.email) {
        throw new Error('Email is required');
      }

      // Busca ou cria o usuário
      let currentUser = await fetchUser(userData.email);
      
      if (!currentUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: userData.email,
            name: userData.name || 'Usuário',
            photo: userData.photo,
            organization: userData.organization,
            telephone: userData.telephone
          })
          .select()
          .single();

        if (createError || !newUser) {
          throw createError || new Error('Failed to create user');
        }

        currentUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || 'Usuário',
          photo: newUser.photo,
          organization: newUser.organization,
          telephone: newUser.telephone
        };
      }

      // Agora temos certeza absoluta que currentUser não é null
      setUser(currentUser);
      toast.success(`Welcome, ${currentUser.name}!`);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUser, navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('googleToken');
    setUser(null);
    setError(null);
    toast.info('You have been logged out');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('googleToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<GooglePayload>(token);
        const userData = await fetchUser(decoded.email);

        if (userData) {
          setUser({
            ...userData,
            name: userData.name || decoded.name || 'Usuário',
            photo: userData.photo || decoded.picture
          });
        }
      } catch (err) {
        console.error('Session check error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [fetchUser, logout]);

  const contextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}