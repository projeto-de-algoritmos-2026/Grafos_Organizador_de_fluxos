import json

def carregar_grafo():
    with open('data/grafo.json', 'r') as f:
        return json.load(f)
    
def salvar_grafo(grafo):
    with open('data/grafos.json', 'w') as f:
        json.dump(grafo, f, indent=4)

# o json esta em listas feitas para o vis renderizar o grafo, nessa funcao traduzimos elas para dicionarios
def converte_json(data):
    grafo={}
    for node in data['nodes']:
        grafo[node["id"]]=[]
    for edge in data["edges"]:
        origem = edge["from"]
        destino = edge["to"]
        grafo[origem].append(destino)

    return grafo


# PARA TESTES:to lendo o arquivo json feito para js e depois convertendo para um q o python entende
# with open('data/grafos_js.json') as f:
#     data=json.load(f)