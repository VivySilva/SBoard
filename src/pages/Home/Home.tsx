// import './Home.module.css';
import styles from './Home.module.css';
import logoImg from '../../assets/Logo.svg';
import { BsCardText } from "react-icons/bs";
import { BsBoundingBoxCircles } from 'react-icons/bs';
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import ProjectCardHome from '../../components/ProjectCardHome/ProjectCardHome';
import { useNavigate } from 'react-router-dom';

export default function Home() {

    const navigate = useNavigate()
    
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLogo}>
                        <img src={logoImg} alt="Logo" loading="lazy" height={'37px'} width={'37px'} />
                        <h1>SBoard</h1>
                    </div>
                    <h2>Dashboard for managing sliced networks</h2>
                    <div className={styles.line} />
                </div>

                <div className={styles.conteniner_left}>
                    <div className={styles.information}>
                        <div className={styles.topic}>
                            <BsCardText size={30} />
                            <h4>Description</h4>
                        </div>
                            <p>SBoard is an interactive web platform designed to visualize,
                            simulate and manage the service cycle of virtual networks
                            within the Network Slicing concept in 5G. The application
                            allows users to analyze the operation of different network
                            slices, track performance metrics and test resource allocation
                            scenarios dynamically.</p>
                    </div>

                    <div className={styles.information}>
                        <div className={styles.topic}>
                            <BsBoundingBoxCircles size={30} />
                            <h4>My projects</h4>
                        </div>
                        <p>Access your latest projects created</p>
                        <div className={styles.projects}>
                            <ProjectCardHome />
                            <ProjectCardHome />
                            <ProjectCardHome />
                            <ProjectCardHome />
                        </div>
                        <button onClick={() => {navigate('/projects')}}>See all Projects<IoIosArrowRoundForward size={30} /></button>
                    </div>

                </div>
                <div className={styles.container_right}>
                    <div className={styles.information}>
                        <div className={styles.topic}>
                            <IoDocumentTextOutline size={30} />
                            <h4>Documentation</h4>
                        </div>
                        <a href="https://github.com/wellington-tinho/SBoard/wiki">https://github.com/wellington-tinho/SBoard/wiki</a>
                    </div>

                    <div className={styles.information}>
                        <div className={styles.topic}>
                            <IoLogoGithub size={30} />
                            <h4>GitHub</h4>
                        </div>
                        <a href="https://github.com/VivySilva/SBoard">https://github.com/VivySilva/SBoard</a>
                    </div>
                </div>
            </div>
        </>
    );
}