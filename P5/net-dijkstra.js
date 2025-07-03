export default function dijkstraConRetardos(nodos, enlaces, origen, destino) {
    const distancia = {};
    const anterior = {};
    const nodosNoVisitados = new Set();

    // Inicializar distancias
    for (const nodo of nodos) {
        distancia[nodo.number] = Infinity;
        anterior[nodo.number] = null;
        nodosNoVisitados.add(nodo.number);
    }

    distancia[origen.number] = 0;

    while (nodosNoVisitados.size > 0) {
        let nodoActual = null;

        for (const nodoId of nodosNoVisitados) {
            if (nodoActual === null || distancia[nodoId] < distancia[nodoActual]) {
                nodoActual = nodoId;
            }
        }

        if (nodoActual === null) break;

        nodosNoVisitados.delete(nodoActual);

        // Buscar enlaces que conecten al nodo actual
        for (const link of enlaces) {
            const [a, b] = link.connectedNodes;

            let vecino = null;

            if (a.number === nodoActual && nodosNoVisitados.has(b.number)) {
                vecino = b;
            } else if (b.number === nodoActual && nodosNoVisitados.has(a.number)) {
                vecino = a;
            }

            if (vecino !== null) {
                const peso = link.pw;
                const nuevaDistancia = distancia[nodoActual] + peso + vecino.delay;

                if (nuevaDistancia < distancia[vecino.number]) {
                    distancia[vecino.number] = nuevaDistancia;
                    anterior[vecino.number] = nodoActual;
                }
            }
        }
    }

    // Reconstruir ruta mínima
    const rutaNodos = [];
    let nodoActual = destino.number;

    while (anterior[nodoActual] !== null) {
        rutaNodos.unshift(nodoActual);
        nodoActual = anterior[nodoActual];
    }

    rutaNodos.unshift(origen.number);

    // Convertir secuencia de nodos a enlaces
    const rutaEnlaces = [];
    for (let i = 0; i < rutaNodos.length - 1; i++) {
        const a = rutaNodos[i];
        const b = rutaNodos[i + 1];
        const enlace = enlaces.find(link =>
            (link.connectedNodes[0].number === a && link.connectedNodes[1].number === b) ||
            (link.connectedNodes[0].number === b && link.connectedNodes[1].number === a)
        );
        if (enlace) {
            rutaEnlaces.push(enlace);
        }
    }

    return rutaEnlaces;
}