import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Graph {
  id?: string;
  nome: string;
  created_by?: string;
  created_in?: string;
  update_in?: string;
}

interface Node {
  id?: string;
  graphs_id: string;
  identifier: string;
  name: string;
  domain: number;
  region: number;
  type: string;
  latitude?: number;
  longitude?: number;
  cpu: number;
  memory: number;
  reliability: number;
  power: number;
  value: number;
  weight: number;
  pos_x: number;
  pos_y: number;
}

interface Edge {
  id?: string;
  graph_id: string;
  source: string;
  target: string;
  bandwidth: number;
  delay: number;
  reliability: number;
  weight: number;
  negative: number;
}

export const createNewGraph = async (userId: string, name: string): Promise<Graph> => {
  const { data, error } = await supabase
    .from('graphs')
    .insert([{ 
      nome: name,
      created_by: userId 
    }])
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('Failed to create graph');
  
  return {
    id: data.id,
    nome: data.nome,
    created_by: data.created_by,
    created_in: data.created_in,
    update_in: data.update_in
  };
};

export const saveGraphStructure = async (
  graphId: string,
  nodes: Node[],
  edges: Edge[],
  name?: string
): Promise<void> => {
  // Atualiza metadados do grafo se o nome foi alterado
  if (name) {
    const { error: graphError } = await supabase
      .from('graphs')
      .update({ 
        nome: name,
        update_in: new Date().toISOString() 
      })
      .eq('id', graphId);
    
    if (graphError) throw new Error(graphError.message);
  }

  // Remove nós e arestas existentes antes de inserir os novos
  await supabase.from('nodes').delete().eq('graphs_id', graphId);
  await supabase.from('edges').delete().eq('graph_id', graphId);

  // Insere novos nós
  const { error: nodesError } = await supabase
    .from('nodes')
    .insert(nodes.map(node => ({
      ...node,
      graphs_id: graphId
    })));
  
  if (nodesError) throw new Error(nodesError.message);

  // Insere novas arestas
  const { error: edgesError } = await supabase
    .from('edges')
    .insert(edges.map(edge => ({
      ...edge,
      graph_id: graphId
    })));
  
  if (edgesError) throw new Error(edgesError.message);
};

export const loadGraphData = async (graphId: string): Promise<{
  graph: Graph;
  nodes: Node[];
  edges: Edge[];
}> => {
  // Busca metadados do grafo
  const { data: graph, error: graphError } = await supabase
    .from('graphs')
    .select('*')
    .eq('id', graphId)
    .single();
  
  if (graphError) throw new Error(graphError.message);

  // Busca nós
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('*')
    .eq('graphs_id', graphId);
  
  if (nodesError) throw new Error(nodesError.message);

  // Busca arestas
  const { data: edges, error: edgesError } = await supabase
    .from('edges')
    .select('*')
    .eq('graph_id', graphId);
  
  if (edgesError) throw new Error(edgesError.message);

  return { graph, nodes: nodes || [], edges: edges || [] };
};

export const getUserGraphs = async (userId: string): Promise<{
  created: Graph[];
  shared: Graph[];
}> => {
  // Grafos criados pelo usuário
  const { data: createdGraphs, error: createdError } = await supabase
    .from('graphs')
    .select('*')
    .eq('created_by', userId);
  
  if (createdError) throw new Error(createdError.message);

  // Grafos compartilhados
  const { data: sharedGraphs, error: sharedError } = await supabase
    .from('collaborating_graphs')
    .select('graphs(*)')
    .eq('user_id', userId);
  
  if (sharedError) throw new Error(sharedError.message);

  return {
    created: createdGraphs || [],
    shared: sharedGraphs?.map((item: any) => item.graphs) || []
  };
};