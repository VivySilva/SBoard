import { lazy, Suspense, useContext } from "react";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { RequestContext } from "../../context/Request/RequestContext";

import { ShowVND } from "./showVND/showVND";
import { Container } from "./styles";
import { useGraph } from "../../context/GraphContext/GraphContext";
import { toast } from "react-toastify";

const CreateRequest = lazy(()=> import("./CreateRequest").then(module=>({default:module.CreateRequest})))
const EditionRequest = lazy(()=> import("./EditionRequest/index").then(module=>({default:module.EditionRequest})))
const AsideOthers = lazy(()=> import("./outhers/others").then(module=>({default:module.AsideOthers})))





export function Aside() {
  const [requestList, setRequestList] = useContext(RequestContext)
  const { currentGraph, saveGraph } = useGraph();
  const qtdRequests = (0)


  //Adicionar novos Requests na lista de requisiçoes
  function appendRequestList(file: any) {

    const reader = new FileReader();
    reader.onload = function (e: any) {
      // setQtdRequests(Object.keys(requestList).length);

      var prevsElements: any = []
      Object.keys(requestList).forEach(key =>
        prevsElements.push(requestList[Number(key)])
      )

      //Adicionadno novos valores á lista de valores inseridos via menu bar
      Object.keys([JSON.parse(e.target.result)][0]).forEach(key =>
        prevsElements.push(JSON.parse(e.target.result)[key])
      )

      console.log(prevsElements)
      setRequestList(prevsElements)
    };

    try {
      reader.readAsText(file.target.files[0]);
    } catch (error) {
      console.error('Erro de reader nao foi inserido um arquivo para ler');
    }
  };

  const handleSaveGraph = async () => {
    if (!currentGraph?.id) {
      toast.warning("Nenhum grafo carregado para salvar");
      return;
    }
    
    try {
      // Aqui você precisaria obter os nodes e edges do Cytoscape
      // Isso depende da sua implementação específica
      const nodes: any[] = []; // Obtenha os nodes do grafo
      const edges: any[] = []; // Obtenha as edges do grafo
      
      await saveGraph(nodes, edges);
      toast.success("Grafo salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar grafo:", error);
      toast.error("Falha ao salvar o grafo");
    }
  };
  
  return (
    <Container>
      <main>
        <h2> Requests</h2>
      </main>

      <div>
        <Tabs className='Tabs'>

          <TabList className='TabList'>
            <Tab className='Tab'> VNR </Tab>
            <Tab className='Tab'> Create </Tab>
            <Tab className='Tab'> Edition </Tab>
            <Tab className='Tab'> Others </Tab>
            {/* <Tab>Toad</Tab> */}
          </TabList>

          <fieldset>
            <TabPanel className='TabPanelVNR'>
              {/* Informaçao sobre os requests, e exibir detalhado */}
              <ShowVND/>
            </TabPanel>


            <TabPanel className='TabPanelCreate'>
              <Suspense fallback={<div>CreateRequest Loading ...</div>}>
                <CreateRequest/>
              </Suspense>
            </TabPanel>

            <TabPanel className='TabPanelEdition'>
              <Suspense fallback={<div>EditionRequest Loading ...</div>}>
                <EditionRequest
                  qtdRequests={qtdRequests} 
                />
              </Suspense>
            </TabPanel>

            <TabPanel className='TabPanelOthers'>
            <Suspense fallback={<div>AsideOthers Loading ...</div>}>
              <AsideOthers
                appendRequestList={appendRequestList}
              />
            </Suspense>
            </TabPanel>
          </fieldset>

        </Tabs>

      </div>
    </Container>
  );
}