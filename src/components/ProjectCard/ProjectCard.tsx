import { useState } from 'react';
import styles from './ProjectCard.module.css';
import Image from '/grafo.jpg';
import { BiEdit, BiShare } from 'react-icons/bi';
import { TbTrash } from 'react-icons/tb';
import { useGraph } from '../../context/GraphContext/GraphContext';
import { toast } from 'react-toastify';

interface ProjectCardProps {
  graph: {
    id: string;
    name: string;
    created_in: string;
    update_in?: string;
  };
  share: boolean;
}

export default function ProjectCard({ graph, share }: ProjectCardProps) {
  const { deleteGraph, shareGraph, updateGraphName } = useGraph();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(graph.name);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Você tem certeza que deseja excluir este projeto?')) {
      try {
      await deleteGraph(graph.id);
      toast.success('Projeto excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir o projeto');
      }
    }
  };

  // const handleShare = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const email = prompt('Digite o email do colaborador:');

  //   if (email) {
  //     try {
  //     await shareGraph(graph.id, email);
  //     toast.success('Projeto compartilhado com ${email}!');
  //   }
  //   catch (error) {
  //     toast.error('Erro ao compartilhar o projeto');
  //   }
  //   }
  // };

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const saveName = async () => {
    if (editedName.trim() && editedName !== graph.name) {
      try {
        await updateGraphName(graph.id, editedName);
        toast.success('Nome do projeto atualizado!');
      } catch (error) {
        toast.error('Erro ao atualizar nome do projeto');
        setEditedName(graph.name); // Reverte em caso de erro
      }
    } else {
      setEditedName(graph.name); // Reverte se cancelado ou inválido
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      setEditedName(graph.name);
      setIsEditing(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src={Image} alt="teste" />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          value={editedName}
          onChange={handleNameChange}
          onBlur={saveName}
          onKeyDown={handleKeyDown}
          maxLength={15}
          // readOnly // Mantenha comentado se quiser edição em linha
          autoFocus
        />
        <ul className={styles.options}>
          <li onClick={editedName ? saveName : startEditing}><BiEdit title={isEditing ? 'Save' : 'Edit'}/></li>
          {/* {share && <li onClick={handleShare}><BiShare title='Compartilhar'/></li>} */}
          {share && <li><BiShare title='Compartilhar'/></li>}
          <li onClick={handleDelete}><TbTrash title='Excluir'/></li>
        </ul>
      </div>
    </div>
  );
}