// import './Home.module.css';
import styles from './Home.module.css';
import logoImg from '../../assets/Logo.svg';

export default function Home() {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLogo}>
                        <img src={logoImg} alt="Logo" loading="lazy" height={'37px'} width={'37px'} />
                        <h1>SBoard</h1>
                    </div>
                    <h2>Dashboard for managing sliced networks</h2>
                </div>
            
            
            
            </div>
        </>
    );
}