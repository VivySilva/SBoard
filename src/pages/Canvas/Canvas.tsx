import styled from "styled-components";
import { Aside } from "../../components/Aside";
import { GraphArea } from "../../components/GraphArea";
import { useParams } from "react-router-dom";
import { useGraph } from "../../context/GraphContext/GraphContext";
import { useCytoscape } from "../../context/CytoscapeGraph/CytoscapeContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Core } from "cytoscape";

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
  const { graphId } = useParams(); // Obtenha o graphId da URL
  const containerRef = useRef<HTMLDivElement>(null);
  const { cy, setCy } = useCytoscape();
  const { loadGraph } = useGraph(); // Adicione o hook useGraph

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeGraph = async () => {
      // Destrói a instância existente
      if (cy) {
        cy.destroy();
      }

      const instance = cytoscape({
        container: containerRef.current,
        elements: [],
        // ... seus estilos ...
      });

      setCy(instance);

      // Se houver graphId, carrega o grafo
      if (graphId) {
        try {
          const { nodes, edges } = await loadGraph(graphId);
          instance.add([
            ...nodes.map(node => ({
              group: 'nodes' as const, // Definindo como tipo literal
              data: node,
              position: node.position // Adicionando posição se existir
            })),
            ...edges.map(edge => ({
              group: 'edges' as const, // Definindo como tipo literal
              data: {
                source: edge.source,
                target: edge.target,
                ...edge
              }
            }))
          ]);   
          instance.layout({ name: 'preset' }).run();
        } catch (error) {
          console.error("Failed to load graph:", error);
        }
      }
    };

    initializeGraph();

    return () => {
      if (cy) {
        cy.destroy();
      }
    };
  }, [graphId]); // Adicione graphId como dependência

  // const { graphId } = useParams();
  // const { cy, setCy } = useCytoscape();
  // const { 
  //   currentGraph, 
  //   loadGraph, 
  //   saveGraph,
  //   createGraph,
  //   loading: graphLoading,
  //   error: graphError 
  // } = useGraph();
  // const [saveStatus, setSaveStatus] = useState("");
  // const [isNewGraph, setIsNewGraph] = useState(false);

  // // Carrega o grafo quando o graphId muda
  // useEffect(() => {
  //   if (!graphId) return;

  //   const loadAndInitializeGraph = async () => {
  //     try {
  //       const { nodes, edges } = await loadGraph(graphId);
        
  //       // Inicializa o Cytoscape com os dados carregados
  //       if (cy) {
  //         // Limpa o grafo existente
  //         cy.elements().remove();
          
  //         // Adiciona os novos nós e arestas
  //         cy.add(nodes.map(node => ({
  //           group: 'nodes',
  //           data: {
  //             id: node.id,
  //             ...node
  //           }
  //         })));
          
  //         cy.add(edges.map(edge => ({
  //           group: 'edges',
  //           data: {
  //             id: edge.id,
  //             source: edge.source,
  //             target: edge.target,
  //             ...edge
  //           }
  //         })));
          
  //         // Ajusta o layout (opcional)
  //         cy.layout({ name: 'preset' }).run();
  //       }
  //     } catch (error) {
  //       console.error("Failed to load graph:", error);
  //     }
  //   };

  //   loadAndInitializeGraph();
  // }, [graphId, loadGraph, cy]);

  // // Carrega o grafo quando o graphId muda
  // // useEffect(() => {
  // //   if (graphId) {
  // //     loadGraph(graphId).then(({ nodes, edges }) => {
  // //       // Aqui você precisará inicializar o Cytoscape com os nodes e edges
  // //       // Isso depende da sua implementação do Cytoscape
  // //       console.log("Graph loaded - initialize cytoscape with:", { nodes, edges });
  // //     });
  // //   }
  // // }, [graphId, loadGraph]);

  // // Função para salvar automaticamente
  // const handleAutoSave = useCallback(async () => {
  //   if (!graphId || !cy) return;
    
  //   try {
  //     setSaveStatus("Salvando...");
      
  //     // Extrai nodes e edges do Cytoscape
  //     const nodes = cy.nodes().map(node => ({
  //       id: node.id(),
  //       ...node.data()
  //     }));
      
  //     const edges = cy.edges().map(edge => ({
  //       id: edge.id(),
  //       source: edge.source().id(),
  //       target: edge.target().id(),
  //       ...edge.data()
  //     }));
      
  //     await saveGraph(nodes, edges, currentGraph?.name);
  //     setSaveStatus("Salvo com sucesso");
  //     setTimeout(() => setSaveStatus(""), 2000);
  //   } catch (error) {
  //     console.error("Failed to save graph:", error);
  //     setSaveStatus("Erro ao salvar");
  //   }
  // }, [cy, graphId, saveGraph, currentGraph?.name]);

  // // Implemente um debounce para o salvamento automático
  // useEffect(() => {
  //   if (!cy) return;
    
  //   const debounceTimer = setTimeout(() => {
  //     handleAutoSave();
  //   }, 2000); // Salva após 2 segundos de inatividade
    
  //   return () => clearTimeout(debounceTimer);
  // }, [cy, handleAutoSave]);

  // if (graphLoading) {
  //   return <div>Carregando grafo...</div>;
  // }

  // if (graphError) {
  //   return <div>Erro ao carregar grafo: {graphError}</div>;
  // }
  return (
    <Content>
      <GraphArea />
      <Aside />
    </Content>
  );
}