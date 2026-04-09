from flask import Flask,request,jsonify,render_template 
from algoritmos import carregar_grafo,salvar_grafo

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


if __name__ == "__main__":
    app.run(debug=True)