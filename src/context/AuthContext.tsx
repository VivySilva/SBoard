import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/authGoogle';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { CredentialResponse } from '@react-oauth/google';

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
  login: (credentialResponse: CredentialResponse) => Promise<void>; 
  register: (userData: Partial<User>) => Promise<void>; 
  logout: () => void;
  loading: boolean;
  error: string | null;
  tempUser: GooglePayload | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<GooglePayload | null>(null);
  const navigate = useNavigate();

  const fetchUser = useCallback(async (email: string): Promise<User | null> => {
    try {
      // Busca o usuário no Supabase
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      // Se houver erro na consulta, lança o erro e se não houver dados, retorna null
      if (queryError) throw queryError;
      if (!data) return null;

      // Retorna os dados do usuário
      return {
        id: data.id,
        email: data.email,
        name: data.name || 'User',
        photo: data.photo,
        organization: data.organization,
        telephone: data.telephone
      };
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }, []);

  const login = useCallback(async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      // Verifica se o token foi recebido
      const decoded = jwtDecode<GooglePayload>(credentialResponse.credential!);
      const userData = await fetchUser(decoded.email);

      // Se o usuário já existe, armazena os dados e redireciona para a home
      if (userData) {
        setUser(userData);
        localStorage.setItem('googleToken', credentialResponse.credential!);
        navigate('/');
      } 
      
      // Se o usuário ainda não existe, armazena os dados temporários e redireciona para o registro
      else {
        setTempUser(decoded);
        localStorage.setItem('tempGoogleUser', JSON.stringify(decoded));
        navigate('/register');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } 
    
    finally {
      setLoading(false);
    }
  }, [fetchUser, navigate]);

  const register = useCallback(async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      // Verifica se o usuário temporário tem email
      if (!tempUser?.email) {
        throw new Error('User data is incomplete.');
      }

      // Verifica se o usuário já existe
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: tempUser.email,
          name: userData.name || tempUser.name || 'User',
          telephone: userData.telephone,
          organization: userData.organization,
          photo: tempUser.picture
        }])
        .select()
        .single();

      // Se houver erro ao criar o usuário, lança o erro e se não houver dados, lança erro de falha no registro
      if (createError) throw createError;
      if (!newUser) throw new Error('User registration failed');

      // Armazena os dados do usuário no estado e no localStorage
      const completeUser = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name || 'User',
            photo: newUser.photo,
            organization: newUser.organization,
            telephone: newUser.telephone
      };

      setUser(completeUser); 
  
      // Limpa os dados temporários
      localStorage.removeItem('tempGoogleUser');
      localStorage.setItem('user', JSON.stringify(completeUser));
      localStorage.setItem('googleToken', tempUser.sub);
      
      toast.success('Registered successfully!');
      navigate('/'); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false); 
    }
  }, [tempUser, navigate]);

  const logout = useCallback(() => {
    // Limpa os dados do usuário e redireciona para a home
    localStorage.removeItem('googleToken');
    localStorage.removeItem('tempGoogleUser');
    setUser(null);
    setTempUser(null);
    setError(null);
    // toast.info('You have been logged out!'); 
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    // Verifica se há um token no localStorage e tenta recuperar os dados do usuário
    const checkSession = async () => {
      const token = localStorage.getItem('googleToken');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        // Decodifica o token para obter o email
        const decoded = jwtDecode<GooglePayload>(token);
        const userData = await fetchUser(decoded.email);

        // Se o usuário foi encontrado, armazena os dados no estado
        if (userData) {
          setUser({
            ...userData,
            name: userData.name || decoded.name || 'User',
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

  // Contexto que será fornecido para os componentes filhos
  const contextValue = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    error,
    tempUser
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