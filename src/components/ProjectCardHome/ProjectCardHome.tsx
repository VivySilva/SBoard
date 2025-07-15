import styles from './ProjectCardHome.module.css';
import Image from '/grafo.jpg';
export default function ProjectCardHome() {
    return (
        <>
        <div className={styles.container}>
            <img src={Image} alt="teste" />
            <p>Projeto 1</p>
        </div>
        </>
    );
}