let grafo01;
let nodes, edges, network;

let botaoNo = document.getElementById("btn-no")
let botaoAresta = document.getElementById("btn-aresta")

botaoNo.addEventListener('click', function () {
    let nomeNo = document.getElementById("novoNo")
    adicionarNo(nomeNo.value, nomeNo.value)
})

botaoAresta.addEventListener('click', () => {
    let origemAresta = document.getElementById("Aresta-o")
    let destinoAresta = document.getElementById("Aresta-d")
    adicionarAresta(origemAresta.value, destinoAresta.value)
})

function atualizarListaNos() {
    const dataList = document.getElementById("lista-nos");
    dataList.innerHTML = "";
    grafo01.nodes.forEach(no => {
        const campo = document.createElement("option")
        campo.value = no.label;
        dataList.appendChild(campo)
        
    });
}

async function init() {
    await carregarGrafo();
    iniciarGrafo(grafo01);
    atualizarListaNos();
}

async function carregarGrafo() {
    const res = await fetch("/grafo");
    grafo01 = await res.json();
    console.log("Grafo carregado", grafo01);
}

function iniciarGrafo(visGrafo) {
    const container = document.getElementById('grafo');


    nodes = new vis.DataSet(visGrafo.nodes);
    edges = new vis.DataSet(visGrafo.edges);

    const data = { nodes, edges };

    const options = {
        edges: { arrows: 'to' }
    };

    network = new vis.Network(container, data, options);
}

// adiciona no 
function adicionarNo(id, label) {
    nodes.add({ id, label });
    grafo01.nodes.push({ id, label });
    console.log(`nó ${id} ,criado com sucesso`)
    salvarGrafo()
    atualizarListaNos()
}


// diciona aresta
function adicionarAresta(from, to) {
    const aresta = { from, to };
    edges.add(aresta);
    grafo01.edges.push(aresta);
    console.log(`aresta de ${from} -> ${to} criada`)
    salvarGrafo()
}

// manda salvar
async function salvarGrafo() {
    const res = await fetch("/grafo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grafo01)
    });

    const resultado = await res.json();
    console.log("Grafo salvo,Resposta do servidor:", resultado);
}

init();