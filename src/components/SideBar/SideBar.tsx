// import './SideBar.module.css';
import styles from './SideBar.module.css';
import { GoPlus } from "react-icons/go";
import { IoHomeOutline } from "react-icons/io5";
import { PiUserCircleFill } from "react-icons/pi";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { BsBoundingBoxCircles } from 'react-icons/bs';
import { IoExitOutline } from "react-icons/io5";
import { motion as MOTION, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { on } from 'events';
import { toast } from 'react-toastify';
import { useGraph } from '../../context/GraphContext/GraphContext';

interface SideBarProps {
    username: string;
    frame: number;
    userPhotoUrl?: string | null; 
    onLogout: () => void;
}

export default function SideBar({ username, frame, onLogout, userPhotoUrl }: SideBarProps) {

    const navigate = useNavigate();
    const { createGraph } = useGraph();

    const handleNewProject = async () => {
        try {
            const newGraph = await createGraph('Novo Projeto');
            navigate(`/canvas/${newGraph.id}`, { replace: true });
            toast.success('Projeto criado com sucesso!');
        } catch (error) {
            toast.error('Falha ao criar novo projeto');
            console.error(error);
        }
    };

    return (
        <>
            <AnimatePresence>

                <MOTION.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.5 }}
                    className={styles.container}>
                    
                    {frame === 0 &&
                        <div className={styles.container}>
                            <PiUserCircleFill className={styles.avatar} size={130} color='var(--green-3)' />
                            
                            <h2>Welcome!</h2>

                            <button onClick={() => navigate('/login')}><IoExitOutline /> Login</button>

                        </div>
                    }   

                    { frame === 1 &&
                        <div className={styles.container}>
                            {/* <PiUserCircleFill className={styles.avatar} size={130} color='var(--green-3)' /> */}
                            {userPhotoUrl ? (
                                <img
                                src={userPhotoUrl}
                                alt={username}
                                className={styles.avatar}
                                style={{ objectFit: 'cover' }} // Garante que a imagem cubra o espaço
                                />
                            ) : (
                            <PiUserCircleFill className={styles.avatar} size={130} color='var(--green-3)' />
                            )}

                            <h2>{username}</h2>

                            <button onClick={handleNewProject}><GoPlus /> New Project</button>

                            <ul className={styles.list_functions}>
                                <li>
                                    <Link to="/" style={{textDecoration:'none', color:'black'}}>
                                            <IoHomeOutline /> Home
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/account" style={{textDecoration:'none', color:'black'}}>
                                            <HiOutlineAdjustmentsHorizontal /> Account Settings
                                    </Link>
                                </li>

                                <li>
                                    <Link to={"/projects"} style={{textDecoration:'none', color:'black'}}>
                                            <BsBoundingBoxCircles /> Projects
                                    </Link>
                                </li>

                                <li>
                                    <button onClick={() => {onLogout(); toast.success("Logged out successfully!");}}>
                                        <IoExitOutline /> Exit
                                    </button>
                                </li>
                            </ul>
                        </div>
                    }
                </MOTION.div>
            </AnimatePresence >
        </>
    );
}