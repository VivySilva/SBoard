import { ElementsDefinition } from "cytoscape";
import { useContext, useEffect, useState } from "react";
import { IsGraphContext } from "../../context/IsGraph/isGraph";
import { CreateGraph } from "../CreateGraph";
import { GraphManipulation } from "../GraphManipulation";
import { UploadGraph } from "../UploadGraph";
import { GraphContainer } from "./styles";
import { useGraph } from "../../context/GraphContext/GraphContext";
import { useCytoscape } from "../../context/CytoscapeGraph/CytoscapeContext";
import { useParams } from "react-router-dom";




export function StartGraph() {

  const [graph, setGraph] = useState({} as ElementsDefinition)
  const {isGraph, setIsGraph} = useContext(IsGraphContext);
  const { loadGraph, currentGraph } = useGraph();
  const { initializeGraph } = useCytoscape();
  const { graphId } = useParams();

  // Carrega o grafo quando o graphId muda
  useEffect(() => {
    if (graphId) {
      const loadExistingGraph = async () => {
        try {
          const { nodes, edges } = await loadGraph(graphId);
          initializeGraph(nodes, edges);
          setIsGraph(true);
        } catch (error) {
          console.error("Failed to load graph:", error);
        }
      };
      loadExistingGraph();
    }
  }, [graphId, loadGraph, initializeGraph, setIsGraph]);

  if (!isGraph) {
    return (
      <GraphContainer>
        <UploadGraph setGraph={setGraph} setIsGraph={setIsGraph}/>
        <CreateGraph setGraph={setGraph} setIsGraph={setIsGraph}/>
      </GraphContainer>
    )
  } else {
    return ( 
      < GraphManipulation grapJSON={graph}/>
    )
  }
}
