import styles from './Login.module.css'
import { FaUserCircle } from "react-icons/fa";
import { BsGoogle } from "react-icons/bs";
import { Link } from "react-router-dom";


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
                        <button
                            className={styles.google_button}
                        ><BsGoogle
                                size={20}
                                style={{ marginRight: 10 }}
                            /> Sign in with Google</button>
                        <span>
                            <p>
                                OR
                            </p>
                        </span>
                        <Link to="/register" className={styles.register_button} style={{ marginTop: 10 }}>
                            Register
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}