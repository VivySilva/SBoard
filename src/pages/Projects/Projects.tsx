import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { useGraph } from '../../context/GraphContext/GraphContext';
import styles from './Projects.module.css';

export default function Projects() {
  const { userGraphs, sharedGraphs, loading, error } = useGraph();

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.my_projects_area}>
        <h1>My Projects</h1>
        <div className={styles.my_projects}>
          {userGraphs.length > 0 ? (
            userGraphs.map(graph => (
              <ProjectCard 
                key={graph.id} 
                graph={graph}
                share={true} 
              />
            ))
          ) : (
            <p>No projects created yet</p>
          )}
        </div>
      </div>
      <div className={styles.my_projects_area}>
        <h1>Shared Projects</h1>
        <div className={styles.my_projects}>
          {sharedGraphs.length > 0 ? (
            sharedGraphs.map(graph => (
              <ProjectCard 
                key={graph.id} 
                graph={graph}
                share={false} 
              />
            ))
          ) : (
            <p>No shared projects</p>
          )}
        </div>
      </div>
    </div>
  );
}
