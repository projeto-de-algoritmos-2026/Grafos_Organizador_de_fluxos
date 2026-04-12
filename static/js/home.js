let grafo01;
let nodes, edges, network;
let ordem;

let botaoNo = document.getElementById("btn-no")
let botaoAresta = document.getElementById("btn-aresta")
let botaoDelNo = document.getElementById("btn-del-no")
let botaoDelAresta = document.getElementById("btn-del-aresta")
let botaoOrdemTop = document.getElementById("btn-ordem")
let botaoDeBfs = document.getElementById("btn-bfs")
let noSelecionado = botaoDeBfs.value
let botaoRestaurar = document.getElementById("btn-restaurar")
let posicoesAntes = null

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
botaoRestaurar.addEventListener('click', async () => {
    await restaurarGrafo()
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
    console.log(data)
    if (data.erro) {
        alert("Erroooo")
    } else {
        await animarB(data)
        //await organizarArvore(noInicio)
        await aplicarSubgrafoBFS(noInicio, data)
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
    await animarB_OT(ordem)

})

async function aplicarSubgrafoBFS(raiz, nosVisitados) {
    network.setOptions({ physics: { enabled: false } })
    await new Promise(resolve => setTimeout(resolve, 50))

    // salva posicoes e arestas atuais antes de qualquer mudanca
    posicoesAntes = {}
    grafo01.nodes.forEach(n => {
        posicoesAntes[n.id] = network.getPosition(n.id)
    })

    const nosSet = new Set(nosVisitados)

    // esconde nos e arestas que nao fazem parte do subgrafo
    const nosForaDoBFS = grafo01.nodes.filter(n => !nosSet.has(n.id))
    const arestasForaDoBFS = grafo01.edges.filter(a => !nosSet.has(a.from) || !nosSet.has(a.to))

    nodes.update(nosForaDoBFS.map(n => ({ id: n.id, hidden: true })))
    edges.update(arestasForaDoBFS.map(a => ({ id: a.id, hidden: true })))

    // organiza os nos visitados em arvore
    network.setOptions({
        edges: {
            smooth: { enabled: true, type: "cubicBezier", forceDirection: "vertical", roundness: 0.4 }
        }
    })

    const niveis = calcularNiveis(raiz)
    const porNivel = {}
    for (const [no, nivel] of Object.entries(niveis)) {
        if (!porNivel[nivel]) porNivel[nivel] = []
        porNivel[nivel].push(no)
    }

    const yGap = 150
    const xGap = 180
    const movimentos = []

    for (const [nivel, nos] of Object.entries(porNivel)) {
        const y = nivel * yGap
        const totalLargura = (nos.length - 1) * xGap
        const xInicio = -totalLargura / 2
        nos.forEach((no, i) => {
            movimentos.push({ id: no, xFim: xInicio + i * xGap, yFim: y })
        })
    }

    await moverNo(movimentos, 900)
    network.fit({ animation: { duration: 600, easingFunction: "easeInOutQuad" } })

    // mostra botao restaurar
    botaoRestaurar.style.display = "block"
}

async function restaurarGrafo() {
    if (!posicoesAntes) return

    network.setOptions({ physics: { enabled: false } })

    nodes.update(grafo01.nodes.map(n => ({ id: n.id, hidden: false })))
    edges.update(grafo01.edges.map(a => ({ id: a.id, hidden: false })))

    network.setOptions({
        edges: {
            smooth: { enabled: true, type: "dynamic", roundness: 0.5 }
        }
    })

    const movimentos = grafo01.nodes.map(n => ({
        id: n.id,
        xFim: posicoesAntes[n.id].x,
        yFim: posicoesAntes[n.id].y
    }))

    await moverNo(movimentos, 900)

    // libera fixed e religa fisica
    nodes.update(grafo01.nodes.map(n => ({ id: n.id, fixed: false })))
    network.setOptions({ physics: { enabled: true } })

    posicoesAntes = null
    botaoRestaurar.style.display = "none"
}

function calcularNiveis(raiz) {
    const niveis = {}
    const fila = [raiz]
    niveis[raiz] = 0

    while (fila.length > 0) {
        const atual = fila.shift()
        const vizinhos = grafo01.edges
            .filter(a => a.from === atual)
            .map(a => a.to)

        for (const vizinho of vizinhos) {
            if (niveis[vizinho] === undefined) {
                niveis[vizinho] = niveis[atual] + 1
                fila.push(vizinho)
            }
        }
    }

    return niveis
}

async function organizarArvore(raiz) {
    network.setOptions({ physics: { enabled: false } })
    await new Promise(resolve => setTimeout(resolve, 50))

    network.setOptions({
        edges: {
            smooth: { enabled: true, type: "cubicBezier", forceDirection: "vertical", roundness: 0.4 }
        }
    })

    const niveis = calcularNiveis(raiz)

    // agrupa os nos por nivel
    const porNivel = {}
    for (const [no, nivel] of Object.entries(niveis)) {
        if (!porNivel[nivel]) porNivel[nivel] = []
        porNivel[nivel].push(no)
    }

    const yGap = 150
    const xGap = 180
    const duracao = 900

    const movimentos = []

    for (const [nivel, nos] of Object.entries(porNivel)) {
        const y = nivel * yGap
        const totalLargura = (nos.length - 1) * xGap
        const xInicio = -totalLargura / 2

        nos.forEach((no, i) => {
            movimentos.push({ id: no, xFim: xInicio + i * xGap, yFim: y })
        })
    }

    await moverNo(movimentos, duracao)
    network.fit({ animation: { duration: 600, easingFunction: "easeInOutQuad" } })
}

// easing easeInOutQuad
function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// move um nó suavemente do ponto atual até (xFim, yFim)
function moverNo(movimentos, duracao) {
    // movimentos = [{ id, xFim, yFim }, ...]
    const inicio = performance.now()

    // captura posicoes iniciais de todos de uma vez
    const origens = movimentos.map(m => {
        const pos = network.getPosition(m.id)
        return { id: m.id, xInicio: pos.x, yInicio: pos.y, xFim: m.xFim, yFim: m.yFim }
    })

    return new Promise((resolve) => {
        function passo(agora) {
            const t = Math.min((agora - inicio) / duracao, 1)
            const e = ease(t)

            // atualiza todos os nos em batch num unico update
            const updates = origens.map(o => ({
                id: o.id,
                x: o.xInicio + (o.xFim - o.xInicio) * e,
                y: o.yInicio + (o.yFim - o.yInicio) * e,
                fixed: true
            }))
            nodes.update(updates)

            if (t < 1) {
                requestAnimationFrame(passo)
            } else {
                resolve()
            }
        }
        requestAnimationFrame(passo)
    })
}


async function atualizaOT(ordem) {
    // desliga physics e estabilização antes de qualquer coisa
    network.setOptions({ physics: { enabled: false } })

    // pequena pausa pra garantir que o physics parou completamente
    await new Promise(resolve => setTimeout(resolve, 50))

    network.setOptions({
        edges: {
            smooth: { enabled: true, type: "curvedCW", roundness: 0.4 }
        }
    })

    const xGap = 220
    const duracao = 4000

    const movimentos = ordem.map((no, index) => ({ id: no, xFim: index * xGap, yFim: 0 }))
    await moverNo(movimentos, duracao)

    network.fit({ animation: { duration: 600, easingFunction: "easeInOutQuad" } })
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
        edges: {
            arrows: 'to',
            smooth: {
                enabled: true,
                type: "dynamic",
                roundness: 0.5
            },
            arrowStrikethrough: false,
            color: {
                color: '#aaa8a4',
                highlight: '#3a56d4',
                hover: '#3a56d4',
                inherit: false
            },
            width: 1.2,
            selectionWidth: 2
        },

        nodes: {
            shape: 'box',
            margin: 25,
            borderWidth: 1,
            borderWidthSelected: 2,
            color: {
                background: '#2e2e2e',
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
                size: 35,
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
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 500,
                fit: true
            },
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 120,
                springConstant: 0.04,
                damping: 0.6,
                avoidOverlap: 0.85
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
    nodes.update(
        ordem.map(id => ({
            id: id,
            color: {
                background: '#2e2e2e',
                border: '#1a1a1a'
            }
        }))
    );
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
            setTimeout(passo, 45);
        }
        passo();
    })
}

async function animarB_OT(ordem) {
    await animar(ordem)
    await atualizaOT(ordem)
    await new Promise(resolve => setTimeout(resolve, 2500))
    resetarAnimacao(ordem)
}
async function animarB(ordem) {
    await animar(ordem)
    await new Promise(resolve => setTimeout(resolve, 2500))
    resetarAnimacao(ordem)
}

init();