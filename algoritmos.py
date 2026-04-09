import json

def carregar_grafo():
    with open('data/grafo.json', 'r') as f:
        return json.load(f)
    
def salvar_grafo(grafo):
    with open('data/grafo.json', 'w') as f:
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
with open('data/grafo.json') as f:
    data=json.load(f)

# Funções para os algoritmos de busca
class Fila():
    def __init__(self):
        self.inicio=0
        self.fim=0
        self.itens=[]

    def vazia(self):
        if(self.inicio == self.fim): return True
        else: return False
    
    def enqueue(self,item):
        self.itens.append(item)
        self.fim+=1
    
    def dequeue(self):
        if self.vazia(): return None
        v=self.itens[self.inicio]
        self.inicio+=1
        return v

def cria_grafo(n):
    lista=[[]for i in range(n)]
    return lista

def adiciona_aresta(inicio,destino,grafo):
    grafo[inicio].append(destino)

def BFS(grafo, inicio):
    visitado={no: False for no in grafo}
    fila=Fila()
    fila.enqueue(inicio)
    visitado[inicio]=True
    ordem=[]
    # print("Busca em largura (BFS)")
    while((fila.vazia())!=True):
        u=fila.dequeue()
        # print(f'{u} -> ', end="")
        ordem.append(u)
        for v in grafo[u]:
            if not visitado[v]:
                visitado[v]=True
                fila.enqueue(v)
    
    return ordem


def ordenacao_topologica(grafo):
    contador={no: 0 for no in grafo}
    for i in grafo:
        for v in grafo[i]:
            contador[v]+=1
    
    fila=Fila()
    for i in contador:
        if(contador[i]==0): fila.enqueue(i)
    
    ordem_topologica=[]
    k=0
    while not fila.vazia():
        v=fila.dequeue()
        ordem_topologica.append(v)

        for vizinho in grafo[v]:
            contador[vizinho]-=1
            if contador[vizinho]==0:
                fila.enqueue(vizinho)
    
    if len(ordem_topologica)<len(grafo):
        return {"erro":"Nao eh um DAG, possui ciclo"}
    
    else: 
        return ordem_topologica

grafo=converte_json(data)
##print(grafo)
ordem_top=ordenacao_topologica(grafo)
##print(ordem_top)