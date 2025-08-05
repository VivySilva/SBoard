from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import networkx as nx
import json
import os
from functools import wraps
from jose import jwt, JWTError
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

graphs_bp = Blueprint('graphs', __name__)

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL or key not found in environment variables")

app.config['SUPABASE_URL'] = supabase_url
app.config['SUPABASE_KEY'] = supabase_key

try:
    supabase = create_client(supabase_url, supabase_key)
    print("Connected to Supabase!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    raise


# Settings for Google OAuth ===========================================================================================
def google_token_required(f):
    """ 
    Decorator to require a valid Google JWT token for accessing certain routes.
    --> Args:
        f (function): The function to be decorated
    --> Returns:
        function: The decorated function that checks for a valid Google JWT token
    --> Raises:
        JWTError: If the token is invalid or if there is an error in decoding
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        elif 'googleToken' in request.json:
            token = request.json['googleToken']

        if not token:
            return jsonify({"error": "Token not found"}), 401

        try:
            user_data = jwt.decode(
                token,
                None,
                audience=app.config['GOOGLE_CLIENT_ID'],
                options={"verify_signature": False}
            )

            if user_data.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise JWTError("Invalid issuer")

            return f(user_data, *args, **kwargs)

        except JWTError as e:
            return jsonify({"error": "Invalid Token", "details": str(e)}), 401

    return decorated


@app.route("/api/auth/register", methods=['POST'])
@google_token_required
def register_user(user_data):
    """ Register a new user in the Supabase database.

    --> Args:    
        user_data (dict): user data from Google JWT token
    --> Returns:
        dict: user data registered in the Supabase database
    --> Raises:
        Exception: error if the user already exists or if there is an issue with the database operation
    """
    try:
        user_email = user_data['email']
        response = supabase.table('users').select(
            '*').eq('email', user_email).execute()

        if len(response.data) > 0:
            return jsonify({"error": "Usuário já cadastrado"}), 400

        new_user = {
            "email": user_email,
            "name": request.json.get('name', user_data.get('name', '')),
            "organization": request.json.get('organization', ''),
            "telephone": request.json.get('phone', ''),
            "photo": user_data.get('picture', '')
        }

        result = supabase.table('users').insert(new_user).execute()

        return jsonify({
            "message": "Usuário registrado com sucesso",
            "user": result.data[0]
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/user", methods=['GET'])
@google_token_required
def get_user(user_data):
    """ Retrieve user data from the Supabase database.

    --> Args:    
        user_data (dict): user data from Google JWT token
    --> Returns:
        dict: user data from the Supabase database
    --> Raises:
        Exception: error if the user does not exist or if there is an issue with the database operation
    """
    try:
        user_email = user_data['email']
        response = supabase.table('users').select(
            '*').eq('email', user_email).execute()

        if len(response.data) == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify(response.data[0])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/verify-google", methods=['POST'])
def verify_google_token():
    """ Verify the Google JWT token and return user data.

    --> Returns:
        dict: user data extracted from the Google JWT token
    --> Raises:
        JWTError: If the token is invalid or if there is an error in decoding
    """

    token = request.json.get('token')
    if not token:
        return jsonify({"error": "Token não fornecido"}), 400

    try:
        user_data = jwt.decode(
            token,
            None,
            audience=app.config['GOOGLE_CLIENT_ID'],
            options={"verify_signature": False}
        )

        return jsonify({
            "user": {
                "email": user_data["email"],
                "name": user_data.get("name", ""),
                "picture": user_data.get("picture", "")
            }
        })

    except JWTError as e:
        return jsonify({"error": "Token inválido", "details": str(e)}), 401

# ====================================================================================================================
# Adicione após as rotas existentes


@app.route("/api/graphs", methods=['POST'])
@google_token_required
def create_graph(user_data):
    try:
        user_email = user_data['email']
        # Primeiro busca o ID do usuário
        user_response = supabase.table('users').select(
            'id').eq('email', user_email).execute()

        if len(user_response.data) == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        user_id = user_response.data[0]['id']
        name = request.json.get('name', 'Novo Projeto')

        # Insere no Supabase
        graph_data = {
            "nome": name,
            "created_by": user_id,
            "update_in": datetime.now().isoformat()
        }

        response = supabase.table('graphs').insert(graph_data).execute()

        return jsonify(response.data[0] if response.data else {}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/graphs/<graph_id>", methods=['PUT'])
@google_token_required
def update_graph(user_data, graph_id):
    try:
        # Verifica se o usuário é o dono do grafo
        user_email = user_data['email']
        user_response = supabase.table('users').select(
            'id').eq('email', user_email).execute()

        if len(user_response.data) == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        user_id = user_response.data[0]['id']

        # Verifica a propriedade do grafo
        graph_response = supabase.table('graphs').select(
            'created_by').eq('id', graph_id).execute()

        if len(graph_response.data) == 0:
            return jsonify({"error": "Grafo não encontrado"}), 404

        if graph_response.data[0]['created_by'] != user_id:
            return jsonify({"error": "Não autorizado"}), 403

        # Atualiza metadados do grafo
        data = request.json
        update_data = {
            "update_in": datetime.now().isoformat()
        }

        if 'name' in data:
            update_data['nome'] = data['name']

        supabase.table('graphs').update(
            update_data).eq('id', graph_id).execute()

        # Remove nós e arestas existentes
        supabase.table('nodes').delete().eq('graphs_id', graph_id).execute()
        supabase.table('edges').delete().eq('graph_id', graph_id).execute()

        # Insere novos nós
        if 'nodes' in data:
            nodes = [{
                **node,
                "graphs_id": graph_id
            } for node in data['nodes']]

            if nodes:
                supabase.table('nodes').insert(nodes).execute()

        # Insere novas arestas
        if 'edges' in data:
            edges = [{
                **edge,
                "graph_id": graph_id
            } for edge in data['edges']]

            if edges:
                supabase.table('edges').insert(edges).execute()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/graphs/<graph_id>", methods=['GET'])
@google_token_required
def get_graph(user_data, graph_id):
    try:
        # Verifica se o usuário tem acesso ao grafo
        user_email = user_data['email']
        user_response = supabase.table('users').select(
            'id').eq('email', user_email).execute()

        if len(user_response.data) == 0:
            return jsonify({"error": "Usuário não encontrado"}), 404

        user_id = user_response.data[0]['id']

        # Verifica se o usuário é o dono ou colaborador
        graph_response = supabase.table('graphs').select(
            '*').eq('id', graph_id).execute()

        if len(graph_response.data) == 0:
            return jsonify({"error": "Grafo não encontrado"}), 404

        graph = graph_response.data[0]

        if graph['created_by'] != user_id:
            # Verifica se é colaborador
            collab_response = supabase.table('collaborating_graphs').select(
                '*').eq('graph_id', graph_id).eq('user_id', user_id).execute()

            if len(collab_response.data) == 0:
                return jsonify({"error": "Não autorizado"}), 403

        # Busca nós
        nodes_response = supabase.table('nodes').select(
            '*').eq('graphs_id', graph_id).execute()
        nodes = nodes_response.data if nodes_response.data else []

        # Busca arestas
        edges_response = supabase.table('edges').select(
            '*').eq('graph_id', graph_id).execute()
        edges = edges_response.data if edges_response.data else []

        return jsonify({
            "graph": graph,
            "nodes": nodes,
            "edges": edges
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>/graphs", methods=['GET'])
@google_token_required
def list_user_graphs(user_data, user_id):
    try:
        # Verifica se o usuário está acessando seus próprios grafos
        requesting_user = supabase.table('users').select(
            'id').eq('email', user_data['email']).execute().data[0]

        if requesting_user['id'] != user_id:
            return jsonify({"error": "Não autorizado"}), 403

        # Grafos criados pelo usuário
        created_graphs = supabase.table('graphs').select(
            '*').eq('created_by', user_id).execute().data

        # Grafos compartilhados
        shared_graphs = supabase.table('collaborating_graphs').select(
            'graphs(*)').eq('user_id', user_id).execute().data

        return jsonify({
            "created": created_graphs if created_graphs else [],
            "shared": [g['graphs'] for g in shared_graphs] if shared_graphs else []
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================================================================================================================

# Routes for converting GML to JSON and simulating Mappend =========================================================
# @app.route("/convert", methods=['POST'])
# def GML_JSON():
#   data= request.get_json()
#   if(data):
#     try:
#       file=data['data']
#       df = nx.parse_gml(file, label='id')
#       return nx.cytoscape_data(df)
#     except:
#       return json.dumps({"error": "Error in converting GML to JSON"})


@app.route("/convert", methods=['POST'])
@google_token_required
def GML_JSON(user_data):
    """ Converte um arquivo GML para o formato JSON do Cytoscape.

    --> Args:
        user_data (dict): Dados do usuário
    --> Returns:
        json: Dados do arquivo GML convertido para o formato JSON do Cytoscape
    --> Raises:
        Exception: Se ocorrer um erro na conversão
    """

    data = request.get_json()
    if data:
        try:
            file = data['data']
            df = nx.parse_gml(file, label='id')

            return jsonify({
                **nx.cytoscape_data(df),
                "user": user_data["email"]
            })

        except Exception as e:
            return jsonify({"error": "Erro na conversão", "details": str(e)}), 400


# @app.route("/mappend", methods=['POST'])
# def Mappend():
#   data= request.get_json()
#   cy_data = {
#     'elements': data['data']['elements'],
#     'data': [],
#   }
#   G = nx.cytoscape_graph(cy_data)
#   response = {
#     'mappend_data': list(G.nodes(data=True))
#   }
#   return json.dumps(response)

@app.route("/mappend", methods=['POST'])
@google_token_required
def Mappend(user_data):
    """ Simula o algoritmo Mappend para o grafo fornecido.

    --> Args:
        user_data (dict): Dados do usuário
    --> Returns:
        json: Dados do grafo simulado pelo algoritmo Mappend
    --> Raises:
        Exception: Se ocorrer um erro na simulação
    """

    data = request.get_json()
    cy_data = {
        'elements': data['data']['elements'],
        'data': [],
    }

    G = nx.cytoscape_graph(cy_data)

    return jsonify({
        "mappend_data": list(G.nodes(data=True)),
        "user": user_data["email"]
    })


# @app.route("/setup", methods=['POST'])
# def Create_Setup_Json():
#     data = request.get_json()
#     file = data['data']
#     arq_json = json.dumps(file)
#     cwd = os.getcwd()
#     # Write to file
#     fo = open(cwd+"/src/data/setup.json", "w")
#     fo.write(arq_json)
#     fo.close()
#     return ''

@app.route("/setup", methods=['POST'])
@google_token_required
def Create_Setup_Json(user_data):
    """ Cria um arquivo JSON de configuração com os dados fornecidos.

    --> Args:
        user_data (dict): Dados do usuário
    --> Returns:
        json: Mensagem de sucesso e email do usuário
    --> Raises:
        Exception: Se ocorrer um erro ao salvar o arquivo
    """
    data = request.get_json()
    file = data['data']
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/setup.json", "w") as fo:
        fo.write(json.dumps(file))
    return jsonify({"message": "Arquivo salvo", "user": user_data["email"]})


@app.route("/", methods=['GET'])
def home():
    return "SBoard API (Flask) - Backend is running!"


if __name__ == '__main__':
    app.run(debug=True)
