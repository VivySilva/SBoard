import { createContext, useState, ReactNode, Dispatch, useCallback, useContext } from "react";
import { Core } from "cytoscape";
import { useGraph } from "../GraphContext/GraphContext";


interface IContextProps {
  cy: Core | undefined;
  setCy: Dispatch<React.SetStateAction<Core | undefined>>,
  initializeGraph: (nodes: any[], edges: any[]) => void;
  getGraphData: () => { nodes: any[], edges: any[] } | null;
}

export const CytoscapeContext = createContext({} as IContextProps)

interface CytoscapeContextPros {
  children:ReactNode
}

export function CytoscapeProvider({children}:CytoscapeContextPros){
  const [cy, setCy] = useState<Core>();
  
  const initializeGraph = useCallback((nodes: any[], edges: any[]) => {
    if (!cy) return;
    
    // Limpa o grafo existente
    cy.elements().remove();
    
    // Adiciona novos nodes e edges
    cy.add(nodes.map(node => ({
      group: 'nodes',
      data: node
    })));
    
    cy.add(edges.map(edge => ({
      group: 'edges',
      data: {
        ...edge,
        source: edge.source,
        target: edge.target
      }
    })));
    
    // Ajusta o layout
    cy.layout({ name: 'cose' }).run();
  }, [cy]);

  const getGraphData = useCallback(() => {
    if (!cy) return null;
    
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
    
    return { nodes, edges };
  }, [cy]);

  return (
    <CytoscapeContext.Provider value={{cy, setCy, initializeGraph, getGraphData}}>
        {children}
    </CytoscapeContext.Provider>
  )
}

export function useCytoscape() {
  const context = useContext(CytoscapeContext);
  if (context === undefined) {
    throw new Error('useCytoscape must be used within a CytoscapeProvider');
  }
  return context;
}