import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  imageUrl: string;
  givenName?: string;
  familyName?: string;
}

export async function handleGoogleLoginSuccess(response: { tokenId: string, profile: GoogleProfile }) {
  try {
    const { tokenId, profile } = response;
    const { email, name, imageUrl, googleId } = profile;

    // 1. Verifica se o usuário já existe no Supabase
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw new Error('Error verifying user existence in Supabase');
    }

    // 2. Se usuário não existe, prepara para registro
    if (!user) {
      const tempUser = { 
        googleId,
        email, 
        name, 
        imageUrl,
        givenName: profile.givenName,
        familyName: profile.familyName
      };
      localStorage.setItem('tempGoogleUser', JSON.stringify(tempUser));
      localStorage.setItem('googleToken', tokenId);
      return null; // Redirecionará para registro
    }

    // 3. Se usuário existe, armazena token e retorna dados
    localStorage.setItem('googleToken', tokenId);
    return {
      ...user,
      photo: user.photo || imageUrl // Atualiza com a foto do Google se necessário
    };

  } catch (error) {
    console.error('Google login error:', error);
    toast.error('Failed to login with Google');
    throw error;
  }
}

export async function completeRegistration(additionalData: { phone: string; organization: string }) {
  try {
    const storedUser = localStorage.getItem('tempGoogleUser');
    if (!storedUser) throw new Error('Data for registration not found');

    const { email, name, imageUrl } = JSON.parse(storedUser);
    const token = localStorage.getItem('googleToken');
    if (!token) throw new Error('Token not found');

    // 1. Registra no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        telephone: additionalData.phone,
        organization: additionalData.organization,
        photo: imageUrl
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Limpa dados temporários
    localStorage.removeItem('tempGoogleUser');
    
    // 3. Notifica sucesso
    toast.success('Registered successfully!');
    return user;

  } catch (error) {
    console.error('Registration error:', error);
    toast.error('Error registering user');
    throw error;
  }
}

export function handleGoogleLoginError() {
  toast.error("Failed to login with Google");
  throw new Error("Failed to login with Google");
}