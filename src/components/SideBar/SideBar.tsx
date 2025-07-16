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

interface SideBarProps {
    username: string;
    frame: number;
    onLogout: () => void;
}

export default function SideBar({ username, frame, onLogout }: SideBarProps) {

    const navigate = useNavigate();

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
                            <PiUserCircleFill className={styles.avatar} size={130} color='var(--green-3)' />

                            <h2>{username}</h2>

                            <button onClick={() => navigate('/canva')}><GoPlus /> New Project</button>

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
                                    <button onClick={onLogout}>
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