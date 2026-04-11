let grafo01;
let nodes, edges, network;
let ordem;

let botaoNo = document.getElementById("btn-no")
let botaoAresta = document.getElementById("btn-aresta")
let botaoDelNo = document.getElementById("btn-del-no")
let botaoDelAresta = document.getElementById("btn-del-aresta")
let botaoOrdemTop = document.getElementById("btn-ordem")
let botaoDeBfs = document.getElementById("btn-bfs")
let botaoDeBfsClear = document.getElementById("btn-bfs-clear")
let noSelecionado = botaoDeBfs.value


botaoDelNo.addEventListener('click', () => {
    let nomeNo = document.getElementById("Del-No").value;
    removerNo(nomeNo)
})

botaoDelAresta.addEventListener('click', () => {
    let from = document.getElementById("Del-Aresta-o").value;
    let to = document.getElementById("Del-Aresta-d").value;
    removerAresta(from, to);

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

botaoDeBfs.addEventListener('click', async () => {
    let noInicio = document.getElementById("NoInicio").value;
    if (!noInicio) {
        alert("Digite um no")
        return
    }
    const res = await fetch("/bfs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inicio: noInicio
        })
    })
    const data = await res.json()

    if (data.erro) {
        alert("Erroooo")
    }
    else {
        console.log(data)
        await animarB(data)

    }

})

botaoOrdemTop.addEventListener('click', async () => {
    const res = await fetch("/ordem_top")
    ordem = await res.json();
    if (ordem.erro) {
        alert('grafo tem ciclo')
        return
    }
    console.log("ordem: ", ordem);

    await animarB(ordem)
    atualizaOT(ordem)
})

function atualizaOT(ordem) {
    network.setOptions({ physics: true })

    ordem.forEach((no, index) => {
        nodes.update({
            id: no,
            x: index * 150,
            y: 0,
            fixed: true
        })

    })

    setTimeout(() => {
        network.setOptions({ physics: false })
    }, 1500)
}

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
        edges: {
            arrows: 'to',
            length: 180,
            smooth: {
                enabled: true,
                type: "curvedCW",
                roundness: 0.4
            },
            arrowStrikethrough: false
        },

        nodes: {
            shape: 'box',
            margin: 10,
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
        },

        physics: {
            enabled: true,
            stabilization: {
                iterations: 200
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

function removerAresta(from, to) {
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

function resetarAnimacao(ordem) {
    let i = 0;
    function passo() {
        if (i >= ordem.length) return;
        const noAtual = ordem[i];

        nodes.update({
            id: noAtual,
            color: { background: '#fffccd' }
        });

        i++;
        setTimeout(passo, 800);
    }

    passo()
    return

}
function animar(ordem) {

    if (ordem.erro) {
        alert("errooooo");
        return;
    }
    let i = 0;

    return new Promise((resolve) => {
        function passo() {
            if (i >= ordem.length) {
                resolve();
                return;
            }
            const noAtual = ordem[i];

            nodes.update({
                id: noAtual,
                color: { background: 'red' }
            });

            i++;
            setTimeout(passo, 800);
        }
        passo();
    })


}


// recebe uma lista -> json
async function animarB(ordem) {
    await animar(ordem)
    await new Promise(resolve => setTimeout(resolve, 2500))// espero dois segundos pra desanimar 
    resetarAnimacao(ordem)
}

init();



