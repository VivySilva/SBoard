import { createContext, ReactNode, useState, useContext, useCallback, useEffect, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/AuthContext'; 
import { createNewGraph, saveGraphStructure, loadGraphData, getUserGraphs, deleteUserGraph, shareGraphWithUser, updateSpecificGraphName } from '../../services/graphService';

// Interface Graph com todos os campos obrigatórios
interface Graph {
  id: string;
  name: string;
  created_by: string;
  created_in: string;
  update_in: string;
}

// Tipo para os dados retornados pelo loadGraph
interface GraphData {
  graph: Graph;
  nodes: any[];
  edges: any[];
}

// Função para validar e normalizar um objeto Graph
function validateGraph(data: any): Graph {
  if (!data || !data.id) {
    throw new Error('Os dados do grafo ou o ID são inválidos');
  }

  return {
    id: data.id,
    name: data.name || 'Sem nome',
    created_by: data.created_by || 'desconhecido',
    created_in: data.created_in || new Date().toISOString(),
    update_in: data.update_in || new Date().toISOString()
  };
}

interface GraphContextType {
  currentGraph: Graph | null;
  userGraphs: Graph[];
  sharedGraphs: Graph[];
  loading: boolean;
  error: string | null;
  createGraph: (name?: string) => Promise<Graph>;
  saveGraph: (nodes: any[], edges: any[], name?: string) => Promise<void>;
  loadGraph: (graphId: string) => Promise<GraphData>;
  loadUserGraphs: () => Promise<void>;
  deleteGraph: (graphId: string) => Promise<void>;
  shareGraph: (graphId: string, userId: string) => Promise<void>;
  updateGraphName: (graphId: string, newName: string) => Promise<void>;
}

export const GraphContext = createContext<GraphContextType | undefined>(undefined);

export function GraphProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user } = useAuth();
  const [currentGraph, setCurrentGraph] = useState<Graph | null>(null);
  const [userGraphs, setUserGraphs] = useState<Graph[]>([]);
  const [sharedGraphs, setSharedGraphs] = useState<Graph[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserGraphs = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { created, shared } = await getUserGraphs(user.id);
      
      const validatedCreated = created.filter(g => g?.id).map(validateGraph);
      const validatedShared = shared.filter(g => g?.id).map(validateGraph);
      
      setUserGraphs(validatedCreated);
      setSharedGraphs(validatedShared);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar os grafos do utilizador';
      console.error(message, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createGraph = useCallback(async (name = 'Novo Projeto'): Promise<Graph> => {
    if (!user?.id) throw new Error('Utilizador não autenticado');
    
    setLoading(true);
    setError(null);
    try {
      const newGraph = await createNewGraph(user.id, name);
      const validatedGraph = validateGraph(newGraph);
      
      setCurrentGraph(validatedGraph);
      await loadUserGraphs(); // Recarrega a lista para consistência
      return validatedGraph;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar o grafo';
      console.error(message, err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadUserGraphs]);

  const saveGraph = useCallback(async (nodes: any[], edges: any[], name?: string) => {
    if (!currentGraph?.id) throw new Error('Nenhum grafo selecionado');
    
    setLoading(true);
    setError(null);
    try {
      await saveGraphStructure(currentGraph.id, nodes, edges, name);
      
      if (name) {
        const updatedGraph = { 
          ...currentGraph, 
          nome: name,
          update_in: new Date().toISOString()
        };
        setCurrentGraph(updatedGraph);
        setUserGraphs(prev => prev.map(g => g.id === updatedGraph.id ? updatedGraph : g));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao guardar o grafo';
      console.error(message, err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentGraph]);

  const loadGraph = useCallback(async (graphId: string): Promise<GraphData> => {
    setLoading(true);
    setError(null);
    
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        const { graph, nodes, edges } = await loadGraphData(graphId);
        const validatedGraph = validateGraph(graph);
        
        setCurrentGraph(validatedGraph);
        return { graph: validatedGraph, nodes, edges };
      } catch (err) {
        lastError = err;
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
      }
    }

    const message = lastError instanceof Error ? lastError.message : 'Failed to load graph after multiple attempts';
    setError(message);
    throw lastError;
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUserGraphs();
    }
  }, [user?.id, loadUserGraphs]);

  const deleteGraph = useCallback(async (graphId: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Chamada ao service 
      await deleteUserGraph(graphId); 
      
      // Atualiza o estado
      setUserGraphs(prev => prev.filter(g => g.id !== graphId));
      setSharedGraphs(prev => prev.filter(g => g.id !== graphId));
      
      if (currentGraph?.id === graphId) {
        setCurrentGraph(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao excluir grafo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentGraph]);

  const shareGraph = useCallback(async (graphId: string, userId: string) => {
    setLoading(true);
    try {
      // Chamada ao service (implemente no graphService.ts)
      await shareGraphWithUser(graphId, userId); 
      
      // Recarrega a lista para refletir o compartilhamento
      await loadUserGraphs();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao compartilhar grafo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUserGraphs]);

  const updateGraphName = useCallback(async (graphId: string, newName: string) => {
    try {
      // Chamada ao service
      await updateSpecificGraphName(graphId, newName);       
      // Atualiza o estado
      setUserGraphs(prev => prev.map(g => 
        g.id === graphId ? { ...g, name: newName } : g
      ));
      setSharedGraphs(prev => prev.map(g => 
        g.id === graphId ? { ...g, name: newName } : g
      ));
      
      if (currentGraph?.id === graphId) {
        setCurrentGraph({ ...currentGraph, name: newName });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar nome';
      setError(message);
      throw err;
    }
  }, [currentGraph]);

  const contextValue = useMemo(() => ({
    currentGraph,
    userGraphs,
    sharedGraphs,
    loading,
    error,
    createGraph,
    saveGraph,
    loadGraph,
    loadUserGraphs,
    deleteGraph,
    shareGraph,
    updateGraphName
  }), [
    currentGraph, 
    userGraphs, 
    sharedGraphs, 
    loading, 
    error, 
    createGraph, 
    saveGraph, 
    loadGraph, 
    loadUserGraphs,
    deleteGraph,
    shareGraph,
    updateGraphName
  ]);

  return (
    <GraphContext.Provider value={contextValue}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph(): GraphContextType {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraph deve ser usado dentro de um GraphProvider');
  }
  return context;
}
