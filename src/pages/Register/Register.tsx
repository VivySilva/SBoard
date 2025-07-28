import styles from './Register.module.css'
import { FaUserCircle } from "react-icons/fa";
// import { BsGoogle } from "react-icons/bs";
import { toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom'
import { useState, useEffect } from 'react';
// import { completeRegistration } from '../../services/authGoogle';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/authGoogle';

export default function Register() {

    const navigate = useNavigate()
    const { register, tempUser, loading, error } = useAuth();
    
    // Estado para armazenar os valores do formulário
    const [values, setValues] = useState({
        name: '',
        email: '',
        phone: '',
        organization: ''
    });


    useEffect(() => {
        // Verifica se há usuário temporário
        const storedUser = localStorage.getItem('tempGoogleUser');
        const userData = storedUser ? JSON.parse(storedUser) : tempUser;

        // // Se não houver usuário temporário, redireciona para login
        // if (!userData) {
        //     navigate('/login');
        //     return;
        // }

        // Preenche os campos do formulário
        setValues({
            name: userData.name || '',
            email: userData.email || '',
            phone: '',
            organization: ''
        });
    }, [tempUser, navigate]);

    function clearForm(){
        setValues({...values, phone: '', organization: ''})
    }

    const phoneMask = (value: string) => {
        if (!value) return ""
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d)(\d{4})$/, "$1-$2")
        return value
    }

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await register({
            name: values.name,
            telephone: values.phone,
            organization: values.organization
        });
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.area_register}>

                    <FaUserCircle
                        size={100}
                        color="var(--green-2)"
                        style={{ marginBottom: 20 }}
                    />

                    <h2>Fill in the following information to register:</h2>

                    <div className={styles.area_forms}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputs}>
                                
                                <div className={styles.container_input}>
                                    <label>Full name:</label>
                                    <input className={styles.input_locked} type="text" value={values.name} onChange={(e) => setValues({...values, name: e.target.value})} readOnly />
                                </div>
                                <div className={styles.container_input}>
                                    <label>E-mail:</label>
                                    <input className={styles.input_locked} type="email" value={values.email} readOnly />
                                </div>
                                <div className={styles.container_input}>
                                    <label>Phone:</label>
                                    <input
                                        type="tel"
                                        placeholder='(xx) x xxxx-xxxx'
                                        value={values.phone}
                                        onChange={(e) => setValues({ ...values, phone: phoneMask(e.target.value) })}
                                        maxLength={15}
                                        required
                                    />
                                </div>
                                <div className={styles.container_input}>
                                    <label>Organization (study/work):</label>
                                    <input
                                        type="text"
                                        placeholder='Ex.: UFPI'
                                        value={values.organization}
                                        onChange={(e) => setValues({ ...values, organization: e.target.value })}
                                        required />
                                </div>

                            </div>

                            <button
                                type='submit'
                                className={styles.register_button}
                                style={{ marginTop: 10 }}
                            >Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}