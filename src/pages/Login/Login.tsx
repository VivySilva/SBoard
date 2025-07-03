import styles from './Login.module.css'
import { FaUserCircle } from "react-icons/fa";
// import { BsGoogle } from "react-icons/bs";
import { Link } from "react-router-dom";

import { GoogleLogin, } from '@react-oauth/google';
import { handleGoogleLoginSuccess, handleGoogleLoginError } from '../../services/authGoogle';


export default function Login() {
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
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                                theme="outline"
                                size="large"
                                text="continue_with"
                            />
                        </div>
                        
                        <span> <p> OR </p> </span>
                        
                        <Link to="/register" className={styles.register_button} style={{ marginTop: 10 }}>
                            Register
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}