import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { jwtDecode } from "jwt-decode";
import { CredentialResponse } from '@react-oauth/google';
import { toast } from 'react-toastify';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

interface GooglePayload {
  email: string;
  name?: string;
  picture?: string; 
  sub: string; // ID do usuário no Google
}

export async function handleGoogleLoginSuccess(credentialResponse: CredentialResponse) {
  try {
    const token = credentialResponse.credential;
    if (!token) throw new Error("Token não recebido");

    // Decodifica o token JWT do Google
    const decodedToken = jwtDecode<GooglePayload>(token);
    const { email, name, picture } = decodedToken;

    // 1. Verifica se o usuário já existe no Supabase
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Se não encontrou o usuário (erro PGRST116 é "nenhum resultado encontrado")
    if (queryError && queryError.code !== 'PGRST116') {
      throw new Error('Erro ao verificar usuário no banco de dados');
    }

    // 2. Se usuário não existe, prepara para registro
    if (!user) {
      const tempUser = { email, name, picture };
      localStorage.setItem('tempGoogleUser', JSON.stringify(tempUser));
      localStorage.setItem('googleToken', token);
      return null; // Redirecionará para registro
    }

    // 3. Se usuário existe, armazena token e retorna dados
    localStorage.setItem('googleToken', token);
    return user;

  } catch (error) {
    console.error('Google login error:', error);
    throw new Error(error instanceof Error ? error.message : 'Falha no login');
  }
}

export async function completeRegistration(additionalData: { phone: string; organization: string; }) {
  try {
    const storedUser = localStorage.getItem('tempGoogleUser');
    if (!storedUser) throw new Error('Dados do usuário não encontrados');

    const { email, name, picture } = JSON.parse(storedUser);
    const token = localStorage.getItem('googleToken');
    if (!token) throw new Error('Token de autenticação não encontrado');

    // 1. Registra no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        telephone: additionalData.phone,
        organization: additionalData.organization,
        photo: picture
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Limpa dados temporários
    localStorage.removeItem('tempGoogleUser');
    
    // 3. Notifica sucesso
    toast.success('Cadastro realizado com sucesso!');
    return user;

  } catch (error) {
    console.error('Registration error:', error);
    toast.error('Erro ao completar cadastro');
    throw error;
  }
}

export function handleGoogleLoginError() {
  toast.error("Falha no login com Google");
  throw new Error("Falha no login com Google");
}
