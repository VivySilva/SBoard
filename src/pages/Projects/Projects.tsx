// import './Projects.module.css';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import styles from './Projects.module.css';

export default function Projects() {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.my_projects_area}>
                    <h1>My Projects</h1>
                    <div className={styles.my_projects}>
                        <ProjectCard share={true} />
                        <ProjectCard share={true} />
                        <ProjectCard share={true} />
                        <ProjectCard share={true} />
                        <ProjectCard share={true} />
                        <ProjectCard share={true} />
                    </div>
                </div>
                <div className={styles.my_projects_area}>
                    <h1>Shared Projects</h1>
                    <div className={styles.my_projects}>
                        <ProjectCard share={false} />
                        <ProjectCard share={false} />
                        <ProjectCard share={false} />
                        <ProjectCard share={false} />
                        <ProjectCard share={false} />
                        <ProjectCard share={false} />
                    </div>
                </div>
            </div>
        </>
    );
}