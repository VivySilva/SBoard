import { jwtDecode } from "jwt-decode"; 
import { CredentialResponse } from '@react-oauth/google';

interface GooglePayload {
  email: string;
  name: string;
  picture: string; 
  sub: string; // ID do usuário no Google
}

export function handleGoogleLoginSuccess(credentialResponse: CredentialResponse) {
  console.log("credentialResponse", credentialResponse);

  const token = credentialResponse.credential;

  if (!token) {
    console.error("Token não veio do Google");
    return;
  }

  const decoded = jwtDecode<GooglePayload>(token);
  console.log("Usuário decodificado:", decoded);

  // Lembre-se do ponto de segurança: o ideal é validar este token no back-end
  // antes de prosseguir. Por enquanto, para o front-end, está funcional.
  localStorage.setItem("user", JSON.stringify(decoded));
  window.location.href = "/register";
}

export function handleGoogleLoginError() {
  console.error("Erro ao logar com o Google");
}