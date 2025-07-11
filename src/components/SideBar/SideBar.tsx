// import './SideBar.module.css';
import styles from './SideBar.module.css';
import { GoPlus } from "react-icons/go";
import { IoHomeOutline } from "react-icons/io5";
import { PiUserCircleFill } from "react-icons/pi";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { BsBoundingBoxCircles } from 'react-icons/bs';
import { IoExitOutline } from "react-icons/io5";
import { motion as MOTION, AnimatePresence } from 'motion/react';



export default function SideBar({ username }: { username: string }) {
    return (
        <>
            <AnimatePresence>

                <MOTION.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.5 }}
                    className={styles.container}>
                    <PiUserCircleFill className={styles.avatar} size={130} color='var(--green-3)' />

                    <h2>{username}</h2>

                    <button><GoPlus /> New Project</button>

                    <ul className={styles.list_functions}>
                        <li><IoHomeOutline /> Home</li>
                        <li><HiOutlineAdjustmentsHorizontal /> Acconunt Settings</li>
                        <li><BsBoundingBoxCircles /> Projects</li>
                        <li><IoExitOutline /> Exit</li>
                    </ul>
                </MOTION.div>
            </AnimatePresence>
        </>
    );
}