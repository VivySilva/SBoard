// import './CallSideBar.module.css';
import React from 'react';
import styles from './CallSideBar.module.css';

import { FiMenu } from "react-icons/fi";
import { CgClose } from "react-icons/cg";
// import { IoCloseOutline } from 'react-icons/io5';

export default function CallSideBar({ isOpen, setIsOpen }: any) {
    return (
        <div 
        className={styles.container}>
            {
                isOpen ?
                    <CgClose
                        onClick={() => setIsOpen(!isOpen)}
                        size={36} />
                    :
                    <FiMenu
                        onClick={() => setIsOpen(!isOpen)}
                        size={30}
                    />


            }

        </div>
    );
}