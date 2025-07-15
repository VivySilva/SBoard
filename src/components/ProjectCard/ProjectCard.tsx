import { useState } from 'react';
import styles from './ProjectCard.module.css';
import Image from '/grafo.jpg';
import { BiEdit, BiShare } from 'react-icons/bi';
import { TbTrash } from 'react-icons/tb';

export default function ProjectCard({share}: {share: boolean}) {

    const [value, setValue] = useState('Projeto 1');

    return (
        <>
            <div className={styles.container}>
                <img src={Image} alt="teste" />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={15}
                        readOnly
                    />
                    <ul className={styles.options}>
                        <li><BiEdit /> </li>
                        {
                            share &&
                        <li><BiShare /> </li>
                        }
                        <li><TbTrash /> </li>
                    </ul>
                </div>
            </div>
        </>
    );
}