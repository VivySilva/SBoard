from flask import Flask, request, jsonify
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

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    raise ValueError("Variáveis do Supabase não configuradas no .env")

app.config['SUPABASE_URL'] = supabase_url
app.config['SUPABASE_KEY'] = supabase_key

# Criação do cliente com tratamento de erro
try:
    supabase = create_client(supabase_url, supabase_key)
    print("✅ Conexão com Supabase estabelecida com sucesso!")
except Exception as e:
    print(f"❌ Erro ao conectar ao Supabase: {e}")
    raise


def google_token_required(f):
    """ 
    Verifica se o token JWT do Google foi fornecido e se ele é valido.
    Se o token for válido, os dados do usuário são passados para a função decorada.
    Caso contrário, retorna um erro 401 (Não autorizado).

    --> Args:
        f (function): A função que será decorada.
    --> Returns:
        function: A função decorada que verifica o token JWT do Google.
    --> Raises:
        JWTError: Se o token não for válido ou se ocorrer um erro na decodificação
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        elif 'googleToken' in request.json:
            token = request.json['googleToken']

        if not token:
            return jsonify({"error": "Token não fornecido"}), 401

        try:
            user_data = jwt.decode(
                token,
                None,
                audience=app.config['GOOGLE_CLIENT_ID'],
                options={"verify_signature": False}
            )

            if user_data.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise JWTError("Emissor inválido")

            return f(user_data, *args, **kwargs)

        except JWTError as e:
            return jsonify({"error": "Token inválido", "details": str(e)}), 401

    return decorated


@app.route("/api/auth/register", methods=['POST'])
@google_token_required
def register_user(user_data):
    try:
        # Verifica se usuário já existe
        user_email = user_data['email']
        response = supabase.table('users').select(
            '*').eq('email', user_email).execute()

        if len(response.data) > 0:
            return jsonify({"error": "Usuário já cadastrado"}), 400

        # Cria novo usuário
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
    """ Verifica o token JWT do Google e retorna os dados do usuário.

    --> Args:
        request (Request): Requisição HTTP
    --> Returns:
        json: Dados do usuário
    --> Raises:
        JWTError: Se o token não for válido ou se ocorrer um erro na decodificação
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
