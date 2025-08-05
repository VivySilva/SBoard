import styled from "styled-components";
import { Aside } from "../../components/Aside";
import { GraphArea } from "../../components/GraphArea";
import { useParams } from "react-router-dom";
import { useGraph } from "../../context/GraphContext/GraphContext";
import { useCytoscape } from "../../context/CytoscapeGraph/CytoscapeContext";
import { useCallback, useEffect, useState } from "react";

const Content = styled.div`
  display: flex;
  /* align-items: stretch; */
  border: 1px solid var(--background);
  height: calc( 100vh - 4rem ); 
  min-width: 500px !important;	
  
  @media (max-width: 1280px){
    height: calc( 100vh - 2.5rem ); 
  }
  
  @media (max-width: 500px){
    flex-direction: column;
    align-items: center;

  }
`

export function Canvas() {
  const { graphId } = useParams();
  const { cy, setCy } = useCytoscape();
  const { 
    currentGraph, 
    loadGraph, 
    saveGraph, 
    loading: graphLoading,
    error: graphError
  } = useGraph();
  const [saveStatus, setSaveStatus] = useState("");

  // Carrega o grafo quando o graphId muda
  useEffect(() => {
    if (graphId) {
      loadGraph(graphId).then(({ nodes, edges }) => {
        // Aqui você precisará inicializar o Cytoscape com os nodes e edges
        // Isso depende da sua implementação do Cytoscape
        console.log("Graph loaded - initialize cytoscape with:", { nodes, edges });
      });
    }
  }, [graphId, loadGraph]);

  // Função para salvar automaticamente
  const handleAutoSave = useCallback(async () => {
    if (!graphId || !cy) return;
    
    try {
      setSaveStatus("Salvando...");
      
      // Extrai nodes e edges do Cytoscape
      const nodes = cy.nodes().map(node => ({
        id: node.id(),
        ...node.data()
      }));
      
      const edges = cy.edges().map(edge => ({
        id: edge.id(),
        source: edge.source().id(),
        target: edge.target().id(),
        ...edge.data()
      }));
      
      await saveGraph(nodes, edges, currentGraph?.nome);
      setSaveStatus("Salvo com sucesso");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save graph:", error);
      setSaveStatus("Erro ao salvar");
    }
  }, [cy, graphId, saveGraph, currentGraph?.nome]);

  // Implemente um debounce para o salvamento automático
  useEffect(() => {
    if (!cy) return;
    
    const debounceTimer = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Salva após 2 segundos de inatividade
    
    return () => clearTimeout(debounceTimer);
  }, [cy, handleAutoSave]);

  if (graphLoading) {
    return <div>Carregando grafo...</div>;
  }

  if (graphError) {
    return <div>Erro ao carregar grafo: {graphError}</div>;
  }
  return (
    <Content>
        <GraphArea />
        <Aside />
      </Content>
  );
}