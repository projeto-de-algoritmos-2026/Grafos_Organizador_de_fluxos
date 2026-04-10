from flask import Flask,request,jsonify,render_template 
from algoritmos import carregar_grafo,salvar_grafo,ordenacao_topologica,converte_json,BFS

app= Flask("__name__")

@app.route("/")
def home():
    #grafo=carregar_grafo()
    return render_template("home.html")

# Onde o grafo eh carregado para o fetch do js
@app.route("/grafo", methods=["GET","POST"])
def get_grafo():
    grafo=carregar_grafo()
    if request.method =="POST":
        grafo=request.get_json()
        salvar_grafo(grafo)
        return jsonify({"status": "ok"})
    return jsonify(grafo)

@app.route("/ordem_top")
def get_ordem():
    data=carregar_grafo()
    grafo=converte_json(data)
    ordem=ordenacao_topologica(grafo)
    return jsonify(ordem)

@app.route("/bfs",methods=["GET","POST"])
def get_bfs():
    if request.method =='POST':
        data=carregar_grafo()
        grafo=converte_json(data)
        data=request.get_json()
        inicio=data['inicio']
        if inicio not in grafo:
            return jsonify({"erro": "No invalido"})
        bfs=BFS(grafo,inicio)
        return jsonify(bfs)


if __name__ == "__main__":
    app.run(debug=True)