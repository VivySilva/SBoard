import styles from './Account.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CiSaveDown2 } from "react-icons/ci";

export default function Account() {
    
    const navigate = useNavigate()

    const [values, setValues] = useState({
            name: 'Viviany Linda Amor de Augusto',
            email: 'vivy@gmail.com',
            phone: '89 99999-9999',
            organization: 'UFPI'
        })
    
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
        
        function handleSubmit(e: any) { 
            e.preventDefault()
            clearForm()
            // verificar se o telefone existe
            // verificar se a organização existe
            // validar email
            toast.success("Changes saved successfully!")
            // navigate('/account')
        }
    
        return (
        <div className={styles.container}>
            <h2>You can change your information:</h2>

            <div className={styles.area_forms}>
                <form onSubmit={handleSubmit}>
                
                    <div className={styles.container_input}>
                        <label>Full name:</label>
                        <input className={styles.input_locked} type="text" value={values.name} readOnly />
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
                            placeholder='Ex: UFPI'
                            value={values.organization}
                            onChange={(e) => setValues({ ...values, organization: e.target.value })}
                            required />
                    </div>
                

                        <button
                            type='submit'
                            className={styles.register_button}
                            >
                            Save Changes <CiSaveDown2 size={25}  />
                        </button>
                </form>
            </div>
        </div>
    );
}