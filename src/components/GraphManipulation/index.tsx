import cytoscape, { ElementsDefinition } from 'cytoscape';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { CytoscapeContext } from '../../context/CytoscapeGraph/CytoscapeContext';
import { ElementModal } from '../ElementModal';
import { GraphStyles } from './styles';
import { useMemo, useCallback } from 'react';

// const ElementModal = lazy(()=> import('../ElementModal').then(module=>({default:module.ElementModal})))
const ChartOptions = lazy(()=> import('../ChartOptions').then(module=>({default:module.ChartOptions})))
const NodeModal = lazy(()=> import('../NodeModal').then(module=>({default:module.NodeModal})))
const EdgeModal = lazy(()=> import('../EdgeModal').then(module=>({default:module.EdgeModal})))

export interface propsGraphJson {
  grapJSON?: ElementsDefinition,
}


Modal.setAppElement('#root')



export function GraphManipulation({ grapJSON }: propsGraphJson) {
  const containerRef = useRef(null);

  const {cy, setCy} = useContext(CytoscapeContext);

  const [nodeElement, setNodeElement] = useState<any>()
  const [edgeElement, setEdgeElement] = useState<any>()

  const processedElements = useMemo(() => {
    if (!grapJSON) return { nodes: [], edges: [] };

    const processedNodes = [...(grapJSON.nodes || [])].map(node => {
      const newNode = { ...node };
      newNode.data = { ...newNode.data, requests: [] };

      if (!newNode.position) {
        if (newNode.data?.pos) {
          newNode.position = {
            x: Number(newNode.data.pos[0] || 0),
            y: Number(newNode.data.pos[1] || 0)
          };
        } else if (newNode.data?.Longitude && newNode.data?.Latitude) {
          newNode.position = {
            x: Number(newNode.data.Longitude),
            y: Number(newNode.data.Latitude)
          };
        } else {
          newNode.position = {
            x: Math.random() * 500,
            y: Math.random() * 500
          };
        }
      }
      return newNode;
    });

    const processedEdges = [...(grapJSON.edges || [])].map((edge, index) => ({
      ...edge,
      data: {
        ...edge.data,
        id: edge.data?.id || `e${index}`,
        delay: edge.data?.delay || Math.floor(Math.random() * 100) + 1,
        reliability: edge.data?.reliability || Math.floor(Math.random() * 100) + 1,
        weight: edge.data?.weight || Math.floor(Math.random() * 100) + 1,
        negative: edge.data?.negative || Math.floor(Math.random() * 100) + 1,
        requests: []
      }
    }));

    return { nodes: processedNodes, edges: processedEdges };
  }, [grapJSON]);

  //configuraçoes e inicializaçao do cytoscape graph
  useEffect(() => {
    if (!containerRef.current || !processedElements.nodes.length) return;

    const config = {
      container: containerRef.current,
      elements: processedElements,
      layout: {
        name: 'preset',
        fit: true, //centraliza
        animate: true,
        animationDuration: 1000,
        spacingFactor: 1, //undefined
        // directed: true,
        // avoidOverlap: true,
        // avoidOverlapPadding: 10,
        // nodeDimensionsIncludeLabels: false,
        // padding: 50,
        // circle: true,
      },
      style: [

        {selector: 'node',
          style: {
            content: 'data(label)',
            'background-color': "rgb(153,153,153)",
            "border-width": 3,
            "border-color": (ele: any) => {
              if (ele.data().type === 't') {
                return ("#da42c5")
              }
              if (ele.data().type === 'c') {
                return ("#3bd1d1")
              }
              if (ele.data().type === 's') {
                return ("#d1cf42")
              } else {
                return ("rgb(153,153,153)")
              }

            },
          }
        },

        {selector: '.eh-ghost-node',
          style: {
            'label': ''
            }
        },

        {selector: 'edge',
          style: {
            'line-style': 'solid',
            'line-color': '#b3b3b3',
            'curve-style': 'bezier ',
            // 'content':  'data(requests)',
            // 'control-point-step-size': 40,
            // 'control-point-weights': 0.5,
            // 'segment-weights': 0.5,
            // 'segment-distances': 20,
            // 'edge-distances': 'intersection',
          }
        },

        {selector: 'edge:selected',
          style: {
            content: (ele: any) => {
              return (
                ' id:' + ele.data().id +
                ' source:' + ele.data().source +
                ' target:' + ele.data().target +
                '\ndelay:' + ele.data().delay +
                ' reliability:' + ele.data().reliability +
                ' \nbandwidth:' + ele.data().weight +
                ' negative:' + ele.data().negative +
                ' \nrequests_ids:' + ele.data().requests
              )
            },
            'line-color': '#4a7aff',
            'textWrap': 'wrap',
            'fontWeight': 'bold',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            // 'text-background-margin': 2,
            'text-border-opacity': 1,
            'text-border-width': 1,
            // 'text-border-style': 'solid',
            'text-border-color': '#33396e',
            'textBackgroundShape': 'round-rectangle',
            'opacity': 1,
            'z-index': 99,
          }
        },

        {selector: '.eh-hover',
         style: {
            'background-color': 'red'
          }
        },

        {selector: '.eh-source',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {selector: '.eh-target',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {selector: '.eh-preview, .eh-ghost-edge',
            style: {
              'background-color': 'red',
              'line-color': 'red',
              'target-arrow-color': 'red',
              'source-arrow-color': 'red'
            }
        },
        
        {selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            'opacity': 0
          }
        },
       
        {selector: 'node:selected',
          style: {
            // classes: 'background',
            content: (ele: any) => {
              return (
                ' id:' + ele.data().id +
                ' label:' + ele.data().label +
                ' name:' + ele.data().name +
                '\n Country:' + ele.data().Country +
                ' domain:' + ele.data().domain +
                ' type:' + ele.data().type +
                '\n region:' + ele.data().region +
                ' pos:' + ele.data().pos +
                ' value:' + ele.data().value +
                ' bandwidth:' + ele.data().weight +
                ' \nrequests_ids:' + ele.data().requests
              )
            },

            'fontWeight': 'bold',
            'textWrap': 'wrap',
            "text-background-padding": '10px',
            "border-width": 5,
            "border-color": "#2901d9",
            'background-color': '#019cd9',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-border-opacity': 1,
            'text-border-width': 1,
            'text-border-color': '#33396e',
            'textBackgroundShape': 'round-rectangle',
            // 'text-background-margin': 1,
            // 'text-valign': 'center',
            // 'text-halign': 'center',
            // 'font-size': '10',
            // "text-max-width": "5px",
          }
        }
      ],
      minZoom: 0.1,
      maxZoom: 6,
      zoomFactor: 0.05, // zoom factor per zoom tick
      zoomDelay: 45, // how many ms between zoom ticks
      zoom: 3
    };
    const instance = cytoscape(config);
    setCy(instance);

    // Configuração de eventos
    const setupEvents = () => {
      instance.on('tap', function(e: any) {
        var currentTapStamp = e.timeStamp;
        var msFromLastTap = currentTapStamp - (previousTapStamp || 0);

        if (msFromLastTap < 350) {
          e.target.trigger('doubleTap', e);
        }
        previousTapStamp = currentTapStamp;
      });

      instance.on('doubleTap', function() {
        handleOpenElementModal();
      });

      instance.on('cxttap', 'node', function(evt: any) {
        setNodeElement(evt.target.data());
        handleOpenNodeModal();
      });

      instance.on('cxttap', 'edge', function(evt: any) {
        setEdgeElement(evt.target.data());
        handleOpenEdgeModal();
      });

      instance.on('cxttap', function(evt: any) {
        if (evt.target === instance) {
          handleOpenChartOptionsModal();
        }
      });
    };

    let previousTapStamp: number;
    setupEvents();

    return () => {
      instance.destroy();
    };
  }, [processedElements, setCy]);

  // funções automaticas inicializadas junto com o grafico 
  function CytoscapeFunctions() {
    var doubleClickDelayMs = 350;
    var previousTapStamp: any;

    cy?.on('tap', function (e: any) {
      var currentTapStamp = e.timeStamp;
      var msFromLastTap = currentTapStamp - previousTapStamp;

      if (msFromLastTap < doubleClickDelayMs) {
        e.target.trigger('doubleTap', e);
      }
      previousTapStamp = currentTapStamp;
    });

    cy?.on('doubleTap', function (event: any, originalTapEvent: any) {
      handleOpenElementModal()
    });

    cy?.on('cxttap ', 'node', function (evt: any) {
      setNodeElement(evt.target.data())
      handleOpenNodeModal()
      // console.log('Node:'+JSON.stringify((evt.target).data(), null, 4))
    });

    cy?.on('cxttap ', 'edge', function (evt: any) {
      setEdgeElement(evt.target.data())
      handleOpenEdgeModal()
      // console.log('Edge:'+JSON.stringify((evt.target).data(), null, 4))
    });

    cy?.on('cxttap', function (evt: any) {
      // target holds a reference to the originator
      // of the event (core or element)
      var evtTarget = evt.target;
      if (evtTarget === cy) {
        handleOpenChartOptionsModal()
        // console.log('tap on background');
      }
    });
  }
  CytoscapeFunctions()


  const [isNodeModal, setIsNodeModal] = useState(false);
  function handleOpenNodeModal() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    setIsNodeModal(true)
  }
  function handleCloseNodeModal() {
    setIsNodeModal(false)
  }

  const [isEdgeModal, setIsEdgeModal] = useState(false);
  function handleOpenEdgeModal() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    setIsEdgeModal(true)
  }
  function handleCloseEdgeModal() {
    setIsEdgeModal(false)
  }

  const [isElementModal, setIsElementModal] = useState(false);
  function handleOpenElementModal() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    setIsElementModal(true)
  }
  function handleCloseElementModal() {
    setIsElementModal(false)
  }

  const [isChartOptionsModal, setIsChartOptionsModal] = useState(false);
  function handleOpenChartOptionsModal() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    setIsChartOptionsModal(true)
  }
  function handleCloseChartOptionsModal() {
    setIsChartOptionsModal(false)
  }


  return (
    <div>
      <div id='cy' >
        <div ref={containerRef} style={{ width: 'calc(100vw - 18rem)', height: '86vh' }} />
      </div>

      
      
      <Suspense fallback={<div>Modals Loading ...</div>}>
        <NodeModal
          isOpen={isNodeModal}
          onRequestClose={handleCloseNodeModal}
          node={nodeElement}
        />

      <EdgeModal
        isOpen={isEdgeModal}
        onRequestClose={handleCloseEdgeModal}
        edge={edgeElement}
        />

      <ElementModal
        isOpen={isElementModal}
        onRequestClose={handleCloseElementModal}
        />

      <ChartOptions
        isOpen={isChartOptionsModal}
        onRequestClose={handleCloseChartOptionsModal}
        />
    </Suspense>
    </div>
  );
}



