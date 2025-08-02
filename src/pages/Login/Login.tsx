import styles from './Login.module.css'
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { BsGoogle } from "react-icons/bs";

import { CredentialResponse, GoogleLogin, } from '@react-oauth/google';
import { useAuth } from '../../context//Auth/AuthContext';
import { handleGoogleLoginSuccess } from '../../services/authGoogle';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export default function Login() {

    const { login, isAuthenticated } = useAuth();

    // Função para lidar com o sucesso do login com Google
    const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;
  
        localStorage.setItem('googleToken', credentialResponse.credential);
        
        try {
            await login(credentialResponse);
            const decoded = jwtDecode(credentialResponse.credential!);
            // console.log('Dados completos do Google:', decoded);
        } catch (error) {
            toast.error("Failed to login with Google");
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.area_login}>

                    <FaUserCircle
                        size={100}
                        color="var(--green-2)"
                        style={{ marginBottom: 20 }}
                    />

                    <h2>Log in to your account to get started:</h2>

                    <div className={styles.area_buttons}>
                        {/* <button className={styles.google_button} onClick={() => login()}>
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                            />
                        </button> */}
                        
                        <div className={styles.google_wrapper}>
                            <GoogleLogin
                                onSuccess={onGoogleLoginSuccess}
                                onError={() => toast.error("Failed to login with Google")}
                                theme="outline"
                                size="large"
                                // text="continue_with"
                            />
                        </div>
                        
                        {/* <span> <p> OR </p> </span>
                        
                        <Link to="/register" className={styles.register_button} style={{ marginTop: 10 }}>
                            Register
                        </Link> */}
                    </div>

                </div>
            </div>
        </>
    );
}