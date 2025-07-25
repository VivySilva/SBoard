import styles from './Login.module.css'
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { BsGoogle } from "react-icons/bs";

import { CredentialResponse, GoogleLogin, } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { handleGoogleLoginSuccess } from '../../services/authGoogle';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export default function Login() {

    const { login } = useAuth();

    const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const decoded = jwtDecode<{ email: string, name?: string, picture?: string }>(
            credentialResponse.credential!
            );
            
            await login({
            email: decoded.email,
            name: decoded.name,
            photo: decoded.picture
            });
        } catch (error) {
            toast.error('Falha no login com Google');
            console.error(error);
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
                                onError={() => toast.error("Falha no login com Google")}
                                theme="outline"
                                size="large"
                                text="continue_with"
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