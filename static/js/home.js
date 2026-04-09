let grafo01;
let nodes, edges, network;

let botaoNo = document.getElementById("btn-no")
let botaoAresta = document.getElementById("btn-aresta")
let botaoDelNo = document.getElementById("btn-del-no")
let botaoDelAresta = document.getElementById("btn-del-aresta")


botaoDelNo.addEventListener('click', () => {
    let nomeNo = document.getElementById("Del-No").value;
    removerNo(nomeNo)
})

botaoDelAresta.addEventListener('click',()=>{
    let from = document.getElementById("Del-Aresta-o").value;
    let to = document.getElementById("Del-Aresta-d").value;
    removerAresta(from,to);

})


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

    var options = {
        edges: { arrows: 'to' },
        //testando
        nodes: {
            shape: 'box',
            color: {
                background: '#fffccd',
                border: '#afafaf',
                highlight: {
                    border: '#020202',
                    background: '#5a5a5a',
                },
                hover: {
                    border: '#07080a',
                }
            },
            font: {
                color: '#000000',
            }
        }

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

function removerNo(id) {
    nodes.remove({ id: id })
    grafo01.nodes = grafo01.nodes.filter((no) => no.id !== id) // refaz a lista com os nos sem aquele que eu tirei 

    grafo01.edges = grafo01.edges.filter(aresta => aresta.from !== id && aresta.to !== id);
    console.log(`nó '${id}' removido com sucesso junto com suas arestas`)

    salvarGrafo()
    atualizarListaNos();
}


// diciona aresta
function adicionarAresta(from, to) {
    const aresta = { from, to };
    edges.add(aresta);
    grafo01.edges.push(aresta);
    console.log(`aresta de ${from} -> ${to} criada`)
    salvarGrafo()
}

function removerAresta(from,to){
    // remove do vis.js
    const arestasParaRemover = edges.get().filter(a => // separa as que sao as removiveis 
        a.from === from && a.to === to
    );

    edges.remove(arestasParaRemover);

    // remove do grefete
    grafo01.edges = grafo01.edges.filter(a => 
        !(a.from === from && a.to === to)
    );

    console.log(`aresta ${from} -> ${to} removida`);

    salvarGrafo();
    

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



