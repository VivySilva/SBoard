import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StartGraph } from '../startGraph';
import { CytoscapeContext } from '../../context/CytoscapeGraph/CytoscapeContext';
import { RequestContext } from '../../context/Request/RequestContext';
import { useGraph } from '../../context/GraphContext/GraphContext';

const SetupModal = lazy((): Promise<any> => import('../SetupModal'));

import { AiOutlineExpandAlt, AiOutlineShrink, AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { BiGitPullRequest, BiSave } from 'react-icons/bi';
import { BsGear, BsLayoutWtf } from 'react-icons/bs';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import { RiChatDeleteLine } from 'react-icons/ri';
import { TbFocusCentered } from 'react-icons/tb';
import { IoAnalyticsOutline } from 'react-icons/io5';

import Modal from 'react-modal';

import { Container, GraphContainer, NavOptions } from "./styles";
import useInitCytoscapeExtensions from '../../hooks/useInitCytoscapeExtensions';
import { useAuth } from '../../context/Auth/AuthContext';
import { toast } from 'react-toastify';



Modal.setAppElement('#root')

export function GraphArea() {
  const {cy} = useContext(CytoscapeContext);
  const setRequest = useContext(RequestContext)[1];
  const [element, setElement] = useState({} as any)
  const [isSetupModal, setIsSetupModal] = useState(false);
  const hiddenFileRequestInput = useRef<any>(null);
  const [drawMode, setDrawMode] = useState(false);
 
  const { currentGraph, saveGraph, loading: graphLoading } = useGraph();
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState("");
  const [graphName, setGraphName] = useState(currentGraph?.name || 'new graph');

  const layouts = [
    {
      name: "preset",
      spacingFactor: 1.5,
      fit: true
    },
    {
      name: "preset",
      spacingFactor: 0.5,
      fit: true
    },
    {
      name: "concentric",
      minNodeSpacing: 12,
      fit: true
    },
    {
      name: 'circle',
      fit: true
    },
    {
      name: 'random',
      fit: true
    },
    {
      name: 'cose',
      fit: true
    },
    {
      name: 'grid',
      fit: true
    },
    {
      name: 'breadthfirst',
      fit: true
    }]
  const { edgeHandles } = useInitCytoscapeExtensions(cy);
  var count = 0
  var prevSpacingFactor = 50 // 50 is the default value in range 0-150

  // Atualiza o nome do grafo quando currentGraph muda
  useEffect(() => {
    if (currentGraph) {
      setGraphName(currentGraph.name);
    }
  }, [currentGraph]);


  // Configura os listeners do Cytoscape
  useEffect(() => {
    if (!cy) return;
    
    cy.on('tap', (event: any) => {
      setElement(event.target._private.data);
    });
    
    // Listener para mudanças no grafo
    cy.on('add remove', () => {
      debouncedSave();
    });

    return () => {
      cy.off('add remove');
      cy.off('tap');
    };
  }, [cy]);

  // Update edgehandles draw mode
  useEffect(() => {
    if (edgeHandles === undefined) return;
    drawMode ? edgeHandles.enableDrawMode() : edgeHandles.disableDrawMode();
  }, [drawMode, edgeHandles]);

  // Debounce para salvamento automático
  const debouncedSave = useCallback(() => {
    if (!cy || !currentGraph?.id || !user?.id) return;
    
    const timer = setTimeout(async () => {
      try {
        setSaveStatus("Salvando...");
        
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
        
        await saveGraph(nodes, edges, graphName);
        setSaveStatus("Salvo com sucesso");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (error) {
        console.error("Failed to save graph:", error);
        setSaveStatus("Erro ao salvar");
        toast.error("Erro ao salvar o grafo");
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [cy, currentGraph?.id, user?.id, saveGraph, graphName]);
  
  function handleOpenSetupModal() {
    setIsSetupModal(true)
  }

  function handleCloseSetupModal() {
    setIsSetupModal(false)
  }

  function handleChangeZoomLevel(level: number) {
    if (cy == undefined) return;
    const newSpacing = cy.zoom() + (level)
    cy.zoom(newSpacing);
  }

  function handleChangeSpacingFactor(spacing: number) {
    if (cy == undefined) return;
    

    if(spacing === prevSpacingFactor){
      prevSpacingFactor = spacing
      spacing = 1
    }
    if(spacing < prevSpacingFactor){
      prevSpacingFactor = spacing
      spacing = 0.9
    }
    if(spacing > prevSpacingFactor){
      prevSpacingFactor = spacing
      spacing = 1.1
    }

    // console.log(spacing)
    cy?.layout({
      name: "preset",
      spacingFactor: spacing,
      fit: true
    } as any).run();
  }
  function handleChangeSpacingFactor2(spacing: number) {
    if (cy == undefined) return;
    
    // console.log(spacing)
    cy?.layout({
      name: "preset",
      spacingFactor: spacing,
      fit: true
    } as any).run();
  }

  function AddEle() {
    try {
      cy?.center(
        cy?.add({
          // group: 'nodes',
          data: {
            "Country": "",
            "domain": 0,
            "label": "",
            "name": "",
            "pos": [
              0,
              0
            ],
            "region": 0,
            "type": "t",
            "value": 0,
            "weight": 0
          },
          position: { x: 1, y: 1 },
        })
      )

    }
    catch (e) {
      console.log('error not AddEle');
    }
  }

  function DelEle() {
    if (cy == undefined) return;
    try {
      var ele = cy.$('#' + element.id);
      cy?.remove(ele);
    }
    catch (e) {
      console.log('error');
    }
  }

  function handleUploadRequestJSON(file: any) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      // console.log(JSON.parse(e.target.result));
      setRequest(JSON.parse(e.target.result));
    };
    try {
      reader.readAsText(file.target.files[0]);
    } catch (error) {
      console.log(error, 'reader');
    }
  };

  function handleClick() {
    hiddenFileRequestInput.current.click();
  };

  function handleChangeLayout() {
    cy?.layout(layouts[count]).run();
    count = (count + 1) % layouts.length
  }

  function handleEdgehandles() {
    setDrawMode(!drawMode)
  }

  const handleManualSave = useCallback(async () => {
    if (!cy || !currentGraph?.id) return;
    
    try {
      setSaveStatus("Salvando...");
      
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
      
      await saveGraph(nodes, edges, graphName);
      setSaveStatus("Salvo com sucesso");
      setTimeout(() => setSaveStatus(""), 2000);
      toast.success("Grafo salvo com sucesso!");
    } catch (error) {
      console.error("Failed to save graph:", error);
      // setSaveStatus("Erro ao salvar");
      // toast.error("Erro ao salvar o grafo");
    }
  }, [cy, currentGraph?.id, saveGraph, graphName]);

  return (
    <Container>
      {/*------ uper options graph buttons --------- */}
      <NavOptions>
        <ul>
          <li className="tooltip">
            <AiOutlineZoomIn fontSize="1.5em" onClick={() => handleChangeZoomLevel(+.1)}  style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <AiOutlineZoomOut fontSize="1.5em" onClick={() => handleChangeZoomLevel(-.1)} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} /> 
            <span className="tooltiptext">Drag zoom in or zoom out</span>
          </li>

          <li className="tooltip">
            <input type="range" name="spacingFactor" id="spacingFactor" min="1" max="150" step="1" onChange={(e) => handleChangeSpacingFactor(Number(e.target.value))} disabled={!cy} />
            <span className="tooltiptext">Controll spacing between elements Graph</span>
          </li>

          <li className="tooltip">
            <AiOutlineExpandAlt fontSize="1.5em" onClick={() => { handleChangeSpacingFactor2(1.1) }}  style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <AiOutlineShrink fontSize="1.5em" onClick={() => { handleChangeSpacingFactor2(0.9) }}  style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Controll spacing between elements Graph</span>
          </li>

          <li className="tooltip">
            <HiOutlineViewGridAdd fontSize="1.5em" cursor="pointer" onClick={AddEle} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <RiChatDeleteLine fontSize="1.5em" cursor="pointer" onClick={DelEle} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Add or remove element graph</span>
          </li>


          <li className="tooltip">
            <BsGear fontSize="1.5em" cursor="pointer" onClick={handleOpenSetupModal} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Open setup modal</span>
          </li>

          <li className="tooltip">
            <BsLayoutWtf fontSize="1.5em" cursor="pointer" onClick={handleChangeLayout} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Change layout</span>
          </li>

          <li className="tooltip">
            <TbFocusCentered fontSize="1.5em" cursor="pointer" onClick={() => cy?.center()} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Center</span>
          </li>

          <li className="tooltip">
            <IoAnalyticsOutline fontSize="1.5em" onClick={handleEdgehandles} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">{drawMode ? 'Draw On' : 'Draw Off'}</span>
          </li>

          <li className="tooltip">
            <input type="file" name="UploadJSON" id="UploadJSON" className='hidden' ref={hiddenFileRequestInput} onChange={handleUploadRequestJSON} />
            <BiGitPullRequest fontSize="1.5em" cursor="pointer" onClick={handleClick} />
            <span className="tooltiptext">Upload archive json from requests</span>
          </li>

          {/* <li className="tooltip">
            <BiSave fontSize="1.5em" cursor="pointer" onClick={handleManualSave} style={{ cursor: cy ? 'pointer' : 'not-allowed' }} />
            <span className="tooltiptext">Salvar grafo</span>
            {saveStatus && <span className="save-status">{saveStatus}</span>}
          </li> */}

          {/* {currentGraph && (
            <li className="graph-name">
              <input 
                type="text" 
                value={graphName} 
                onChange={(e) => setGraphName(e.target.value)} 
                onBlur={() => debouncedSave()}
              />
            </li>   
          )}

          <li className="tooltip">
            <BiSave 
              onClick={handleManualSave} 
              style={{ cursor: cy ? 'pointer' : 'not-allowed' }} 
            />
            <span className="tooltiptext">Salvar grafo</span>
            {saveStatus && <span className="save-status">{saveStatus}</span>}
          </li>
          '' */}
        </ul>
      </NavOptions>

      {/*------ StartGraph (GraphContainer / UploadGraph) --------- */}
      <GraphContainer>
        <StartGraph />
      </GraphContainer>

      {/*------ SetupModal --------- */}
      <Suspense fallback={<div>Loading...</div>}>
        < SetupModal
          isOpen={isSetupModal}
          onRequestClose={handleCloseSetupModal}
        />
      </Suspense>

    </Container>
  )
}