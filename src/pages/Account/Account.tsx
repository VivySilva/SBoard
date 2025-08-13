import styles from './Account.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CiSaveDown2 } from "react-icons/ci";
import { useAuth } from '../../context/Auth/AuthContext';
import { supabase } from '../../services/authGoogle';
import { set } from 'react-hook-form';

export default function Account() {
    
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [values, setValues] = useState({
        name: '',
        email: '',
        telephone: '',
        organization: ''
    });
    
    useEffect(() => {
        if (user) {
            setValues({
                name: user.name || '',
                email: user.email || '',
                telephone: user.telephone || '',
                organization: user.organization || ''
            });
        }
    }, [user]);

    const phoneMask = (value: string) => {
        if (!value) return ""
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d)(\d{4})$/, "$1-$2")
        return value
    }
    
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        setIsSubmitting(true);
        
        try {    
            // Verifica se houve mudanças
            if (user?.telephone === values.telephone && user?.organization === values.organization) 
            {
                toast.info("No changes detected");
                return;
            }
            
            // Validação básica de telefone
            if (values.telephone.replace(/\D/g, '').length < 10) {
                toast.error("Please enter a valid telephone number");
                return;
            }
            
            // Validação de organização
            if (values.organization.length < 2) {
                toast.error("Organization name is too short");
                return;
            }

            // Atualizar os dados do usuário no Supabase
            const { error } = await supabase
            .from('users')
            .update({
                telephone: values.telephone,
                organization: values.organization
            })
            .eq('id', user?.id);
            
        if (error) throw error;
        
        // Atualizar o usuário no contexto
        await updateUser({
            telephone: values.telephone,
            organization: values.organization
        });

        toast.success("Changes saved successfully!");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to save changes";
            toast.error(errorMessage);
            console.error('Update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>You can change your information:</h2>

            <div className={styles.area_forms}>
                <form onSubmit={handleSubmit}>
                
                    <div className={styles.container_input}>
                        <label>Name:</label>
                        <input className={styles.input_locked} type="text" value={values.name} readOnly />
                    </div>
                    
                    <div className={styles.container_input}>
                        <label>E-mail:</label>
                        <input className={styles.input_locked} type="email" value={values.email} readOnly />
                    </div>     
                    
                    <div className={styles.container_input}>
                        <label>telePhone:</label>
                        <input
                            type="tel"
                            placeholder='(xx) x xxxx-xxxx'
                            value={values.telephone}
                            onChange={(e) => setValues({ ...values, telephone: phoneMask(e.target.value) })}
                            maxLength={15}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className={styles.container_input}>
                        <label>Organization (study/work):</label>
                        <input
                            type="text"
                            placeholder='Ex: UFPI'
                            value={values.organization}
                            onChange={(e) => setValues({ ...values, organization: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                

                        <button
                            type='submit'
                            className={styles.register_button}
                            disabled={isSubmitting}
                            >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                            <CiSaveDown2 size={25}  />
                        </button>
                </form>
            </div>
        </div>
    );
}