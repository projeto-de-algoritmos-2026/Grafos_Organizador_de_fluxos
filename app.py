from flask import Flask,request,jsonify

def carregar_grafo():
    pass

def salvar_grafo():
    pass

app= Flask("__name__")

@app.route("/")
def home():
    grafo=carregar_grafo()

@app.route("/grafo", methods=["GET","POST"])
def get_grafo():
    grafo=carregar_grafo
    if request.method =="POST":
        grafo=request.get_json()
        salvar_grafo(grafo)
        return jsonify({"status": "ok"})
    return jsonify(grafo)


if __name__ == "__main__":
    app.run(debug=True)