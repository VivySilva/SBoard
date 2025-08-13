<p align="center">	
   <a href="https://www.linkedin.com/in/wellington123/">
      <img alt="Wellington" src="https://img.shields.io/badge/-Wellington123-5965e0?style=flat&logo=Linkedin&logoColor=white" />
   </a>
   <a href="https://www.linkedin.com/in/seu-linkedin/">
      <img alt=" Viviany" src="https://www.linkedin.com/in/viviany-silva-654621220?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" />
   </a>
  
  <img alt="License" src="https://img.shields.io/badge/license-MIT-5965e0">
</p>
<br>

<p align="center">
   <h1>SBoard</h1>
   <h3>Evolução do Sistema de Gerenciamento de Redes Virtuais</h3>

   <img src="https://github.com/wellington-tinho/SBoard/blob/main/src/assets/ScreenExemple.png" alt="Tela da Aplicação" width="720"/>
</p>

Painel de gerenciamento de redes virtuais seguindo o modelo 5G/NaaS com sistema de autenticação e armazenamento em nuvem.

<div align="center">
   <sub>Projeto original desenvolvido por 
    <a href="https://github.com/wellington-tinho">Wellington Rodrigues</a>
   </sub>
   <br>
   <sub>Melhorias e novas funcionalidades por
    <a href="https://github.com/VivySilva">Viviany Silva</a>
   </sub>
</div>


## :star: Novas Funcionalidades

- **Sistema de Autenticação Completo**
  - Login e Cadastro de usuários
  - Integração com Google Auth
  - Gerenciamento de contas

- **Armazenamento em Nuvem**
  - Modelagem de banco de dados relacional (PostgreSQL)
  - Integração com Supabase
  - Persistência de grafos por usuário

- **Novas Telas e Fluxos**
  - Página de Projetos com listagem personalizada
  - Página de Configurações de Conta
  - Home Page redesenhada

## :computer: Tecnologias
Tecnologias e ferramentas utilizadas no desenvolvimento do projeto:

* [ReactJS](https://reactjs.org/) 
* [Cytoscape](http://js.cytoscape.org/)
* [Flask](https://flask.palletsprojects.com/) 

## :computer: Tecnologias Adicionadas

* [Supabase](https://supabase.com/) - Banco de dados em nuvem
* [React OAuth](https://github.com/MomenSherif/react-oauth) - Autenticação com Google
* [React Router v6](https://reactrouter.com/) - Navegação avançada
* [React Toastify](https://fkhadra.github.io/react-toastify/) - Notificações do sistema

## :wrench: Melhorias Implementadas

1. **Backend**
   - Nova modelagem de banco de dados
   - Endpoints para gestão de usuários
   - Integração com serviços externos

2. **Frontend**
   - Fluxo completo de autenticação
   - Componentização avançada
   - Gestão de estado global
   - Persistência de dados

3. **UI/UX**
   - Design system consistente
   - Telas responsivas
   - Feedback visual melhorado

## :construction_worker: Como Rodar (Atualizado)
Para rodar a aplicação certifique de ter instalado na maquina o [Python](https://www.python.org/) e o [Node](https://nodejs.org/en/download/).

Após instalado ambos execulte o codigo abaixo no terminal para baixar seu gerenciador de pacotes. (yarn).
```bash
$ npm install --global yarn
```

Baixado as ferramentas agora é necessário baixar os pacotes e bibliotecas necessárias para executar á aplicação, para isso:

```bash
# Clone o Repositorio
$ git clone https://github.com/VivySilva/SBoard

```bash
# Configure as variáveis de ambiente
Crie um arquivo .env na raiz com:
VITE_GOOGLE_CLIENT_ID=seu_cliente_id
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=seu_url
VITE_SUPABASE_ANON_KEY=sua_chave

Crie um arquivo .env na pasta do backend com:
GOOGLE_CLIENT_ID=seu_cliente_id
SECRET_KEY=sua_chave_secreta_aleatória
BACKEND_URL=http://localhost:5000
SUPABASE_URL=seu_url
SUPABASE_ANON_KEY=sua_chave

# Entre na pasta do projeto
$ cd SBoard/
```
Abra um novo terminal dentro da pasta. 

Em um terminal execute o comando,
```bash
# Seu_pah\SBoard>
$ yarn
```
Este comando irá baixar todas dependências para executar o projeto ReactJS

No outro terminal:
```bash
# Va para pasta backend
$ cd backend

# Seu_pah\SBoard\api>
$ pip install -r requirements.txt
```
Este comando irá Baixar todos os pacotes necessários para executar o script .py

Após isso neste mesmo terminal execute o arquivo
```bash
# Seu_pah\SBoard\api>
$ python app.py
```

E por ultimo no terminal anterior, da raiz do projeto execute 
```bash
# Seu_pah\SBoard>
$ yarn start
```

:bulb: Próximas Features
Compartilhamento de projetos entre usuários

Versionamento de grafos

<h4 align="center"> Projeto original por <a target="_blank">Wellington</a> <br> Melhorias por <a target="_blank">Seu Nome</a> </h4> ```