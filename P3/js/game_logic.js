/**
 * @todo Lista de tareas pendientes:
 * ✅ Mostrar imagen del jugador (clase + draw)
 * ✅ Mostrar imagen de alien (clase + draw)
 * ✅ Física de movimiento
 * ✅ Física de proyectiles
 * ✅ Cluster y fisicas
 * ✅ Proyectiles jugador
 * 🔲 Fondo animado
 * 🔲 Menú de inicio
 * ✅ Pantallas de final (victoria/derrota)
 * ✅ Efectos de sonido
 */


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // Permite dibujar encima

canvas.width = innerWidth;
canvas.height = innerHeight;

let player;
let projectiles = [];
let alienCluster;
let gameRunning = false;
let score = 0;

const shootSound = new Audio('sonidos/disparo.mp3');
const explosionSound = new Audio('sonidos/destruccion de nave.mp3');
shootSound.volume = 0.3;
explosionSound.volume = 0.5;

export function startGameWithDifficulty({speed, rows, cols}) {
    gameRunning = true;
    player = new Player();
    projectiles = [];
    alienCluster = new Cluster(speed, rows, cols);

    alienCluster.createCluster().then(() => {
        animate();
    });
}

class Player {
    modelScale = 0.1;
    bottomMargin = 20;
    playerRotation = 0.12;
    imageSource = 'image_assets/protagonista.png';

    constructor(imageSource = 'image_assets/protagonista.png', scale = 0.1) {
        this.imageSource = imageSource;
        this.modelScale = scale;
        this.speed = {
            x: 5,
            y: 0
        };
        this.oxigen = 60;
        this.direction = 0;
        this.rotation = 0;
        const image = new Image();
        image.src = this.imageSource;
        image.onload = () => {
            this.image = image;
            this.width = image.width * this.modelScale;
            this.height = image.height * this.modelScale;
            this.position = {
                x: canvas.width / 2 - this.width / 2, // Inicialmente en el centro
                y: canvas.height - this.height - this.bottomMargin
            };
        };
    }

    resetPosition() {
        this.position.x = canvas.width / 2 - this.width / 2;
        this.position.y = canvas.height - this.height - this.bottomMargin;
    }

    movePlayer() {
        this.position.x += this.speed.x * this.direction;
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > canvas.width)
            this.position.x = canvas.width - this.width;
    }

    update() {
        if (this.image) {
            this.movePlayer();
            this.draw();
        }
    }

    draw() {
        //Se encarga de darle un pequeño tilt al inicio del movimiento
        ctx.save();
        ctx.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        ctx.rotate(this.rotation);
        ctx.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
        );
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }
}

class Projectile {
    constructor({speed, position}) {
        this.speed = speed;
        this.position = position;
        this.radius = 3;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    moveProyectile() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
    }

    update() {
        this.draw();
        this.moveProyectile();
    }
}

class Alien {
    imageSource = 'image_assets/enemigo_basico.png';
    modelScale = 0.05;

    constructor({x, y}) {
        this.speed = {x: 5, y: 0}
        // Se elimina la propiedad direction individual
        this.visible = true;
        this.position = {x, y};

        this.imageLoaded = new Promise(resolve => {
            const image = new Image();
            image.src = this.imageSource;
            image.onload = () => {
                this.image = image;
                this.width = image.width * this.modelScale;
                this.height = image.height * this.modelScale;
                resolve();
            };
        });
    }

    draw() {
        if (!this.image) {
            console.warn("Alien sin imagen aún:", this);
            return;
        }
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    // Se elimina el método move, dejando el control de movimiento al Cluster

    update() {
        if (this.image && this.visible) {
            // Solo se dibuja el alien
            this.draw();
        }
    }
}

class Cluster {
    constructor(speed = 2, rows = 5, cols = 8) {
        this.aliens = [];
        this.speed = speed;
        this.direction = 1;
        this.padding = 10;
        this.moveDownDistance = 20;
        this.rows = rows;
        this.cols = cols;
        this.clusterCreated = false;
    }

    async createCluster() {
        const startX = 50;
        const startY = 50;
        const sampleAlien = new Alien({x: 0, y: 0});
        await sampleAlien.imageLoaded;

        this.alienWidth = sampleAlien.width + this.padding;
        this.alienHeight = sampleAlien.height + this.padding;

        const loadPromises = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const alien = new Alien({
                    x: startX + j * this.alienWidth,
                    y: startY + i * this.alienHeight
                });
                this.aliens.push(alien);
                loadPromises.push(alien.imageLoaded);
            }
        }

        await Promise.all(loadPromises);
        this.clusterCreated = true;
        return this;
    }

    move() {
        if (!this.clusterCreated) return;
        let shouldChangeDirection = false;

        this.aliens.forEach(alien => {
            if (alien.visible) {
                alien.position.x += this.speed * this.direction;
                if (alien.position.x <= 0 || alien.position.x + alien.width >= canvas.width) {
                    shouldChangeDirection = true;
                }
            }
        });

        if (shouldChangeDirection) {
            this.direction *= -1;
            this.aliens.forEach(alien => {
                if (alien.visible) {
                    alien.position.y += this.moveDownDistance;
                }
            });
        }
    }

    update() {
        if (!this.clusterCreated) return;
        this.move();
        this.aliens.forEach(alien => alien.update());
    }

    checkAllAliensDestroyed() {
        return this.aliens.every(alien => !alien.visible);
    }
}

//Controles
document.addEventListener("keyup", () => {
    player.direction = 0;
    player.rotation = 0;
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
        player.direction = 1;
        player.rotation = player.playerRotation;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        player.direction = -1;
        player.rotation = -player.playerRotation;
    } else if (e.key === " ") {
        projectiles.push(new Projectile({
            speed: {
                x: player.speed.x * player.direction,
                y: -15
            },
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y
            }

        }))
        shootSound.currentTime = 0;
        shootSound.play().catch(e => console.log("Error al reproducir disparo:", e));
    }


});

//Detectores de colision:
function makeAlienInvisible(alien) {
    alien.visible = false;
}

function checkProjectileAlienCollisions(projectiles, aliens) {
    projectiles.forEach((projectile, pIndex) => {
        aliens.forEach((alien, aIndex) => {
            if (alien.visible &&
                projectile.position.x + projectile.radius > alien.position.x &&
                projectile.position.x - projectile.radius < alien.position.x + alien.width &&
                projectile.position.y + projectile.radius > alien.position.y &&
                projectile.position.y - projectile.radius < alien.position.y + alien.height
            ) {
                projectiles.splice(pIndex, 1);
                makeAlienInvisible(alien);
                score += 10; // Incrementar puntuación
            }
        });
    });
}


function checkAlienPlayerCollision(player, aliens) {
    return aliens.some(alien =>
        alien.visible &&
        player.position.x < alien.position.x + alien.width &&
        player.position.x + player.width > alien.position.x &&
        player.position.y < alien.position.y + alien.height &&
        player.position.y + player.height > alien.position.y
    );
}

//Funcion principal de animacion
function animate() {
    if (!gameRunning) return
    requestAnimationFrame(animate)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar puntuación
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Puntuación: ${score}`, canvas.width - 20, 30);

    player.update();
    alienCluster.update();

    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.position.y + projectile.radius < 0) {
            projectiles.splice(index, 1);
        }
    });

    checkProjectileAlienCollisions(projectiles, alienCluster.aliens);

    const playerCollision = checkAlienPlayerCollision(player, alienCluster.aliens);
    const allAliensDestroyed = alienCluster.checkAllAliensDestroyed();

    if (playerCollision || allAliensDestroyed) {
        gameRunning = false;
        const message = playerCollision ? "GAME OVER" : "¡VICTORIA!";
        setTimeout(() => {
            alert(`${message}\nPuntuación final: ${score}`);
            changeState("MENU");
        }, 100);

    }

}


/*
/
};

// Configuración de la raqueta


// Configuración de los ladrillos
const LADRILLO = {
    F: 4,
    C: 8,
    w: 80,
    h: 20,
    padding: 10,
    origen_x: 30,
    origen_y: 50,
    visible: true
};

const ladrillos = [];

// Inicializar ladrillos
for (let i = 0; i < LADRILLO.F; i++) {
    ladrillos[i] = [];
    for (let j = 0; j < LADRILLO.C; j++) {
        ladrillos[i][j] = {
            x: LADRILLO.origen_x + (LADRILLO.w + LADRILLO.padding) * j,
            y: LADRILLO.origen_y + (LADRILLO.h + LADRILLO.padding) * i,
            w: LADRILLO.w,
            h: LADRILLO.h,
            visible: LADRILLO.visible
        };
    }
}



// Dibujar ladrillos
function dibujarLadrillos() {
    for (let i = 0; i < LADRILLO.F; i++) {
        for (let j = 0; j < LADRILLO.C; j++) {
            const ladrillo = ladrillos[i][j];
            if (ladrillo.visible) {
                ctx.beginPath();
                ctx.rect(ladrillo.x, ladrillo.y, ladrillo.w, ladrillo.h);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Detectar colisión con paredes
function detectarColisionParedes() {
    if (bola.x + bola.radio > canvas.width || bola.x - bola.radio < 0) {
        bola.dx = -bola.dx;
    }
    if (bola.y - bola.radio < 0) {
        bola.dy = -bola.dy;
    }
}

// Detectar colisión con la raqueta
function detectarColisionRaqueta() {
    if (
        bola.x > raqueta.x &&
        bola.x < raqueta.x + raqueta.w &&
        bola.y + bola.radio > raqueta.y
    ) {
        bola.dy = -bola.dy;
    }
}

// Detectar colisión con ladrillos
function detectarColisionLadrillos() {
    for (let i = 0; i < LADRILLO.F; i++) {
        for (let j = 0; j < LADRILLO.C; j++) {
            const ladrillo = ladrillos[i][j];
            if (ladrillo.visible) {
                if (
                    bola.x > ladrillo.x &&
                    bola.x < ladrillo.x + ladrillo.w &&
                    bola.y > ladrillo.y &&
                    bola.y < ladrillo.y + ladrillo.h
                ) {
                    bola.dy = -bola.dy;
                    ladrillo.visible = false;
                    puntuacion += 10;
                    puntuacionElemento.textContent = puntuacion;
                }
            }
        }
    }
}

// Control de la raqueta con teclado
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
        raqueta.direccion = 1;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        raqueta.direccion = -1;
    }
});

document.addEventListener("keyup", () => {
    raqueta.direccion = 0;
});

// Actualizar posición de la raqueta
function moverRaqueta() {
    raqueta.x += raqueta.velocidad * raqueta.direccion;

    // Limitar movimiento dentro del canvas
    if (raqueta.x < 0) raqueta.x = 0;
    if (raqueta.x + raqueta.w > canvas.width) raqueta.x = canvas.width - raqueta.w;
}

// Bucle principal del juego
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dibujarLadrillos();
    dibujarBola();
    dibujarRaqueta();

    detectarColisionParedes();
    detectarColisionRaqueta();
    detectarColisionLadrillos();

    bola.x += bola.dx;
    bola.y += bola.dy;

    moverRaqueta();

    // Verificar si se perdieron todos los ladrillos
    const quedanLadrillos = ladrillos.some(fila => fila.some(l => l.visible));
    if (!quedanLadrillos) {
        alert("¡Ganaste! Puntuación: " + puntuacion);
        document.location.reload();
    }

    // Verificar si la bola cayó
    if (bola.y + bola.radio > canvas.height) {
        alert("¡Perdiste! Puntuación: " + puntuacion);
        document.location.reload();
    }

    requestAnimationFrame(update);
}

update();*/