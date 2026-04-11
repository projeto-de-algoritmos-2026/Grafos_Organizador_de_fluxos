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
    const res = await fetch(`/bfs/${nomeGrafo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inicio: noInicio })
    })
    const data = await res.json()

    if (data.erro) {
        alert("Erroooo")
    } else {
        console.log(data)
        await animarB(data)
    }
})

botaoOrdemTop.addEventListener('click', async () => {
    const res = await fetch(`/ordem_top/${nomeGrafo}`)
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
        nodes.update({ id: no, x: index * 150, y: 0, fixed: true })
    })
    setTimeout(() => { network.setOptions({ physics: false }) }, 0)
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
    const res = await fetch(`/grafo/${nomeGrafo}`);
    grafo01 = await res.json();
    console.log("Grafo carregado", grafo01);
}

function iniciarGrafo(visGrafo) {
    const container = document.getElementById('grafo');

    nodes = new vis.DataSet(visGrafo.nodes);
    edges = new vis.DataSet(visGrafo.edges);

    const data = { nodes, edges };

    var options = {
        // layout: {
        //     hierarchical: {
        //         enabled: true,
        //         direction: 'UD',        
        //         sortMethod: 'directed', // usa a direção das arestas pra organizar
        //         nodeSpacing: 150,
        //         levelSeparation: 250
        //     }
        // },
        edges: {
            arrows: 'to',
            length: 300,
            smooth: {
                enabled: true,
                type: "dynamic",
                roundness: 0.4
            },
            arrowStrikethrough: false,
            color: {
                color: '#aaa8a4',
                highlight: '#3a56d4',
                hover: '#3a56d4',
                inherit: false
            },
            width: 1.5,
            selectionWidth: 2
        },

        nodes: {
            shape: 'box',
            margin: 20,
            borderWidth: 2,
            borderWidthSelected: 2,
            color: {
                background: '#464444',
                border: '#1a1a1a',
                highlight: {
                    border: '#3a56d4',
                    background: '#3d3d3d',
                },
                hover: {
                    border: '#555',
                    background: '#3a3a3a',
                }
            },
            font: {
                color: '#f0ede8',
                size: 15,
                face: 'Inter, sans-serif'
            },
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.18)',
                size: 6,
                x: 0,
                y: 2
            }
        },

        physics: {
            enabled: true,
            stabilization: { iterations: 200 },
            barnesHut: {
                gravitationalConstant: -5000,
                centralGravity: 0.3,
                springLength: 150,
                springConstant: 0.02,
                damping: 0.2,
                avoidOverlap:2

            }
        }
    };

    network = new vis.Network(container, data, options);
}

function adicionarNo(id, label) {
    nodes.add({ id, label });
    grafo01.nodes.push({ id, label });
    console.log(`nó ${id} criado com sucesso`)
    salvarGrafo()
    atualizarListaNos()
}

function removerNo(id) {
    nodes.remove({ id: id })
    grafo01.nodes = grafo01.nodes.filter((no) => no.id !== id)
    grafo01.edges = grafo01.edges.filter(aresta => aresta.from !== id && aresta.to !== id);
    console.log(`nó '${id}' removido com sucesso junto com suas arestas`)
    salvarGrafo()
    atualizarListaNos();
}

function adicionarAresta(from, to) {
    const aresta = { from, to };
    edges.add(aresta);
    grafo01.edges.push(aresta);
    console.log(`aresta de ${from} -> ${to} criada`)
    salvarGrafo()
}

function removerAresta(from, to) {
    const arestasParaRemover = edges.get().filter(a => a.from === from && a.to === to);
    edges.remove(arestasParaRemover);
    grafo01.edges = grafo01.edges.filter(a => !(a.from === from && a.to === to));
    console.log(`aresta ${from} -> ${to} removida`);
    salvarGrafo();
}

async function salvarGrafo() {
    const res = await fetch(`/grafo/${nomeGrafo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grafo01)
    });
    const resultado = await res.json();
    console.log("Grafo salvo, Resposta do servidor:", resultado);
}

function resetarAnimacao(ordem) {
    return new Promise((resolve) => {
        let i = 0;
        function passo() {
            if (i >= ordem.length) { resolve(); return; }
            nodes.update({
                id: ordem[i],
                color: {
                    background: '#464444',
                    border: '#1a1a1a'
                }
            });
            i++;
            setTimeout(passo, 600);
        }
        passo()
    })
}

function animar(ordem) {
    if (ordem.erro) { alert("errooooo"); return; }
    let i = 0;
    return new Promise((resolve) => {
        function passo() {
            if (i >= ordem.length) { resolve(); return; }
            nodes.update({
                id: ordem[i],
                color: {
                    background: '#3a56d4',
                    border: '#2f47b8'
                }
            });
            i++;
            setTimeout(passo, 800);
        }
        passo();
    })
}

async function animarB(ordem) {
    await animar(ordem)
    await new Promise(resolve => setTimeout(resolve, 2500))
    await resetarAnimacao(ordem)
}

init();