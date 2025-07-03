import dijkstraConRetardos from "./net-dijkstra.js";
// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// DOM references
const generateBtn = document.getElementById('generateBtn');
const nNodesSpan = document.getElementById('nNodes');
const generatedNetSpan = document.getElementById('generatedNet');
const calculateBtn = document.getElementById('calculateBtn');
const totalDelaySpan = document.getElementById('totalDelay');

let nodes = [];
let links = [];
let netGenerated = false;
let shortestPath = [];
let highlightCounter = 0;


// --- Complementary palette ---
const complementaryColors = [
    ["hsl(0,70%,50%)", "hsl(180,70%,50%)"],
    ["hsl(30,70%,50%)", "hsl(210,70%,50%)"],
    ["hsl(60,70%,50%)", "hsl(240,70%,50%)"],
    ["hsl(120,70%,50%)", "hsl(300,70%,50%)"],
    ["hsl(90,70%,50%)", "hsl(270,70%,50%)"]
];

// --- Classes ---
class Node {
    static count = 0;

    constructor(radius, delay, color) {
        this.radius = radius;
        this.delay = delay;
        this.color = color;
        this.padding = 30;
        this.number = Node.count++;
        const {x, y} = this.generateValidPosition();
        this.x = x;
        this.y = y;
    }

    generateValidPosition(linkPadding = 10) {
        let attempts = 0;

        while (attempts < 1000) {
            const x = randomInt(this.padding + this.radius, canvas.width - this.padding - this.radius);
            const y = randomInt(this.padding + this.radius, canvas.height - this.padding - this.radius);

            // 1) Nodo–nodo (saltarse self)
            const notOverlappingNodes = nodes.every(other => {
                if (other.number === this.number) return true;
                const dx = other.x - x;
                const dy = other.y - y;
                const dist = Math.hypot(dx, dy);
                return dist > other.radius + this.radius + this.padding;
            });

            // 2) Nodo–link
            const notOverlappingLinks = links.every(link => {
                const [a, b] = link.connectedNodes;
                const distSeg = distancePointToSegment(x, y, a.x, a.y, b.x, b.y);
                return distSeg > this.radius + linkPadding;
            });

            if (notOverlappingNodes && notOverlappingLinks) {
                return {x, y};
            }
            attempts++;
        }

        console.warn(`Node#${this.number} fallback to center after position attempts`);
        return {x: canvas.width / 2, y: canvas.height / 2};
    }


    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.number, this.x, this.y - 10);

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(`${this.delay} ms`, this.x, this.y + 10);
    }
}

class Link {
    constructor(nodeA, nodeB) {
        this.connectedNodes = [nodeA, nodeB];
        this.pw = randomInt(65, 1000);
        this.color = nodeA.number < nodeB.number ? nodeA.color : nodeB.color;
        console.debug(`Link created: ${nodeA.number}-${nodeB.number} pw=${this.pw}`);
    }

    draw() {
        const [a, b] = this.connectedNodes;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const startX = a.x + a.radius * Math.cos(angle);
        const startY = a.y + a.radius * Math.sin(angle);
        const endX = b.x - b.radius * Math.cos(angle);
        const endY = b.y - b.radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${this.pw} ms`, midX, midY - 5);
    }
}

// --- Utility ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Generate Network ---


/**
 * Garantiza que cada nodo tenga al menos `minLinks` conexiones.
 * - Primero crea una cadena lineal 0–1, 1–2, …, (n-2)–(n-1)
 * - Luego añade enlaces aleatorios hasta que todos los nodos tengan grado >= minLinks
 *
 * @param {Array<Node>} nodes  Lista de nodos
 * @param {Array<Link>} links  Lista inicial de enlaces (se rellenará)
 * @param {number} minLinks    Grado mínimo deseado por nodo (por defecto 2)
 */
function ensureMinLinks(nodes, links, minLinks = 2) {
    // Mapa nodo → grado actual
    const degree = new Map(nodes.map(n => [n, 0]));

    // 1) Cadena básica (sin cerrar ciclo)
    for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        links.push(new Link(a, b));
        degree.set(a, degree.get(a) + 1);
        degree.set(b, degree.get(b) + 1);
    }

    // 2) Añadir enlaces aleatorios hasta grado >= minLinks
    const maxAttemptsPerNode = 100; // para evitar bucles infinitos
    let madeProgress;

    do {
        madeProgress = false;

        for (const node of nodes) {
            // Mientras este nodo no alcance el grado mínimo
            let attempts = 0;
            while (degree.get(node) < minLinks && attempts < maxAttemptsPerNode) {
                // Elige un destino aleatorio distinto
                const target = nodes[randomInt(0, nodes.length - 1)];
                const keyExists = links.some(link =>
                    link.connectedNodes.includes(node) &&
                    link.connectedNodes.includes(target)
                );

                if (
                    target !== node &&           // no self-loop
                    !keyExists                   // no enlace duplicado
                ) {
                    // Crear nuevo enlace
                    links.push(new Link(node, target));
                    degree.set(node, degree.get(node) + 1);
                    degree.set(target, degree.get(target) + 1);
                    madeProgress = true;
                }
                attempts++;
            }
            // Si no lo hemos logrado tras muchos intentos, avisamos
            if (degree.get(node) < minLinks) {
                console.warn(`No se pudo dar grado≥${minLinks} a Node#${node.number} tras ${maxAttemptsPerNode} intentos.`);
            }
        }
        // Repetir mientras en alguna pasada se haya añadido al menos un enlace
    } while (madeProgress);
}

function drawHighlights() {
    if (!shortestPath.length) return;

    highlightCounter = (highlightCounter + 1) % 60;
    if (highlightCounter < 30) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "lime";
        shortestPath.forEach(link => {
            const [a, b] = link.connectedNodes;
            const angle = Math.atan2(b.y - a.y, b.x - a.x);
            const startX = a.x + a.radius * Math.cos(angle);
            const startY = a.y + a.radius * Math.sin(angle);
            const endX = b.x - b.radius * Math.cos(angle);
            const endY = b.y - b.radius * Math.sin(angle);
            const width = 10;

            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.hypot(dx, dy);
            const angleDeg = Math.atan2(dy, dx);

            ctx.translate(startX, startY);
            ctx.rotate(angleDeg);
            ctx.fillRect(0, -width / 2, length, width);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        });
        ctx.restore();
    }
}

function distancePointToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);

    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    const tClamped = Math.max(0, Math.min(1, t));
    const closestX = x1 + tClamped * dx;
    const closestY = y1 + tClamped * dy;
    return Math.hypot(px - closestX, py - closestY);
}

routeBtn.addEventListener("click", () => {
    if (!netGenerated || nodes.length < 2) {
        alert("Ruta no puede ser calculada al no haber ninguna red generada.");
        return;
    }

    const source = nodes[0];
    const target = nodes[nodes.length - 1];
    shortestPath = dijkstraConRetardos(nodes, links, source, target);

    // Reconstruir secuencia de nodos en la ruta
    const routeNodes = [source];
    shortestPath.forEach(link => {
        const [a, b] = link.connectedNodes;
        const next = (a === routeNodes[routeNodes.length - 1]) ? b : a;
        routeNodes.push(next);
    });

    // Sumar delays
    const totalDelay = routeNodes.reduce((sum, node) => sum + node.delay, 0);
    totalDelaySpan.textContent = `${totalDelay} ms`;

    console.debug(
        "Shortest path links:", shortestPath.map(l => `${l.connectedNodes[0].number}-${l.connectedNodes[1].number}`),
        "Nodes:", routeNodes.map(n => n.number),
        "Total Delay:", totalDelay
    );
});

generateBtn.addEventListener("click", () => {
    console.clear();
    console.debug("=== Generating New Network ===");

    //Detener anterior highlight
    shortestPath = [];
    highlightCounter = 0;
    totalDelaySpan.textContent = ""

    nodes = [];
    links = [];
    Node.count = 0;
    netGenerated = true;

    const total = randomInt(3, 5);
    console.debug(`Generating ${total} nodes`);

    // Create nodes
    for (let i = 0; i < total; i++) {
        const radius = 30;
        const delay = randomInt(100, 1000);
        const color = complementaryColors[i % complementaryColors.length][0];
        const node = new Node(radius, delay, color);
        nodes.push(node);
    }


    ensureMinLinks(nodes, links, 2);

    // Update UI
    nNodesSpan.textContent = nodes.length;
    generatedNetSpan.textContent = netGenerated ? "Sí" : "No";
});


// --- Animation loop ---
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    links.forEach(link => link.draw());
    nodes.forEach(node => node.draw());
    drawHighlights();

    requestAnimationFrame(animate);
}

animate();
