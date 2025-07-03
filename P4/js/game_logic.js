/**
 * @todo
 * DONE Clase tile
 * DONE Clase board
 * Ajuste a tamaño de dispositivo de clase Background
 * DONE Size de clase board tied to Bg
 * DONE Movimiento tile
 * DONE Imagenes de tile
 * DONE Logica general
 * 🔲 Cronometro de boom
 * DONE Fondo animado
 * DONE Menú de inicio
 * DONE Pantallas de final (victoria/derrota)
 * 🔲 Efectos de sonido
 */
//Variable y o metodos importados
import {Menu} from './menu.js';

//Atributos tomados del canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

//Variables del juego
let score = 0;
let flippedTiles = [];
let gameStarted = false;
let canClick = true; // Variable para controlar si se puede hacer clic

function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

resizeCanvas();

class Background {
    constructor() {
        this.dimensions = {
            height: 600,
            width: 600
        };
        this.position = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        this.cornerRadius = 20;
    }

    draw() {
        ctx.beginPath();
        ctx.roundRect(
            this.position.x - this.dimensions.width / 2,
            this.position.y - this.dimensions.height / 2,
            this.dimensions.width,
            this.dimensions.height,
            this.cornerRadius
        );
        ctx.fillStyle = 'rgba(10,10,101,0.9)';
        ctx.fill();
    }
}

class Tile {
    static imageSource = {
        1: 'image_assets/Emoji1.png',
        2: 'image_assets/Emoji2.png',
        3: 'image_assets/Emoji3.png',
        4: 'image_assets/Emoji4.png',
        5: 'image_assets/Emoji5.png',
        6: 'image_assets/Emoji6.png',
        7: 'image_assets/Emoji7.png',
        8: 'image_assets/Emoji8.png',
        9: 'image_assets/Emoji9.png',
        10: 'image_assets/Emoji10.png',
        11: 'image_assets/Emoji11.png',
        12: 'image_assets/Emoji12.png',
        13: 'image_assets/Emoji13.png',
        14: 'image_assets/Emoji14.png',
        15: 'image_assets/Emoji15.png',
        16: 'image_assets/Emoji16.png',
        17: 'image_assets/Emoji17.png',
        18: 'image_assets/Emoji18.png',
        19: 'image_assets/Emoji19.png',
        20: 'image_assets/Emoji20.png',
        21: 'image_assets/Emoji21.png',
        22: 'image_assets/Emoji22.png',
        23: 'image_assets/Emoji23.png',
        24: 'image_assets/Emoji24.png',
        25: 'image_assets/Emoji25.png',
        26: 'image_assets/Emoji26.png',
        27: 'image_assets/Emoji27.png',
        28: 'image_assets/Emoji28.png',
        29: 'image_assets/Emoji29.png',
        30: 'image_assets/Emoji30.png',
        31: 'image_assets/Emoji31.png',
        32: 'image_assets/Emoji32.png'
    };

    constructor({x, y}, imageIndex) {
        //Posicion y tamaño
        this.position = {x, y};
        this.width = 60;
        this.height = 60;
        //Animación
        this.isFlipped = false;
        this.frontColor = "white";
        // !! CAMBIO: Color de la parte trasera
        this.backColor = "#add8e6"; // Azul claro
        this.flipProgress = 0;

        this.isAnimating = false;
        this.imageScale = 0.5;
        //Logica de juego
        this.isMatched = false

        if (imageIndex && Tile.imageSource[imageIndex]) {
            this.image = new Image();
            this.image.src = Tile.imageSource[imageIndex];
            this.imageIndex = imageIndex; // Guardar el índice
            this.image.onload = () => {
                this.imgWidth = this.image.width * this.imageScale;
                this.imgHeight = this.image.height * this.imageScale;
            };
        }
    }

    flip() {
        if (!this.isAnimating) {
            this.isAnimating = true;
        }
    }

    draw() {
        ctx.save();

        // Flip animation
        if (this.isAnimating || this.flipProgress > 0) {
            const progress = this.isFlipped ? this.flipProgress : 1 - this.flipProgress;
            const scaleX = Math.abs(0.5 - progress) * 2;

            ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            ctx.scale(scaleX, 1);
            ctx.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height / 2));
        }

        ctx.fillStyle = this.isFlipped ? this.frontColor : this.backColor;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        if (this.isFlipped && this.image && this.image.complete) {
            const imgX = this.position.x + (this.width - this.imgWidth) / 2;
            const imgY = this.position.y + (this.height - this.imgHeight) / 2;
            ctx.drawImage(this.image, imgX, imgY, this.imgWidth, this.imgHeight);
        }

        ctx.restore();
    }

    update() {
        if (this.isAnimating) {
            this.flipProgress += 0.08;
            if (this.flipProgress >= 1) {
                this.flipProgress = 0;
                this.isAnimating = false;
                this.isFlipped = !this.isFlipped;
            }
        }
    }

    containsPoint(x, y) {
        return (
            x >= this.position.x &&
            x <= this.position.x + this.width &&
            y >= this.position.y &&
            y <= this.position.y + this.height
        );
    }
}

class Board {
    constructor() {
        this.padding = 20;
        this.tiles = [];
        this.gameWon = false; // Flag para saber si se ha ganado
    }

    createBoard(difficulty, background) {
        switch (difficulty) {
            case 1:
                this.rows = 2;
                this.columns = 2;
                break;
            case 2:
                this.rows = 4;
                this.columns = 4;
                break;
            case 3:
                this.rows = 6;
                this.columns = 6;
                break;
            default:
                this.rows = 2;
                this.columns = 2;
        }

        const indices = this.generateImageIndices(difficulty);
        const shuffledPairs = this.shufflePairs(indices);
        const {tileWidth, tileHeight} = this.calculateTileDimensions(background);
        const startPos = this.calculateStartPosition(background, tileWidth, tileHeight);
        this.generateTiles(startPos, tileWidth, tileHeight, shuffledPairs);

        return this;
    }

    // !! NUEVA FUNCIÓN: Muestra todas las fichas
    showInitialTiles() {
        canClick = false; // Desactivar clics
        this.tiles.forEach(tile => tile.isFlipped = true);

        setTimeout(() => {
            this.tiles.forEach(tile => tile.isFlipped = false);
            canClick = true; // Reactivar clics
        }, 3000); // 3 segundos
    }

    generateImageIndices(difficulty) {
        const amount = {1: 2, 2: 8, 3: 18}[difficulty];
        const indices = new Set();
        while (indices.size < amount) {
            indices.add(Math.floor(Math.random() * 32) + 1);
        }
        return Array.from(indices);
    }

    shufflePairs(indices) {
        const pairs = [];
        indices.forEach(idx => pairs.push(idx, idx));
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }
        return pairs;
    }

    calculateTileDimensions(background) {
        const availableSpace = {
            width: background.dimensions.width - 2 * this.padding,
            height: background.dimensions.height - 2 * this.padding
        };

        return {
            tileWidth: (availableSpace.width - (this.columns - 1) * this.padding) / this.columns,
            tileHeight: (availableSpace.height - (this.rows - 1) * this.padding) / this.rows
        };
    }

    calculateStartPosition(background, tileWidth, tileHeight) {
        const gridWidth = this.columns * tileWidth + (this.columns - 1) * this.padding;
        const gridHeight = this.rows * tileHeight + (this.rows - 1) * this.padding;

        return {
            x: background.position.x - gridWidth / 2,
            y: background.position.y - gridHeight / 2
        };
    }

    generateTiles(startPos, tileWidth, tileHeight, indices) {
        this.tiles = [];
        let currentIndex = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const tile = new Tile(
                    {
                        x: startPos.x + col * (tileWidth + this.padding),
                        y: startPos.y + row * (tileHeight + this.padding)
                    },
                    indices[currentIndex]
                );

                tile.width = tileWidth;
                tile.height = tileHeight;

                this.tiles.push(tile);
                currentIndex++;
            }
        }
    }

    update() {
        this.tiles.forEach(tile => {
            tile.update();
            tile.draw();
        });
    }

    checkForMatch() {
        if (flippedTiles.length === 2) {
            canClick = false; // Bloquear clics mientras se comprueba
            const [tile1, tile2] = flippedTiles;

            if (tile1.imageIndex === tile2.imageIndex) {
                tile1.isMatched = true;
                tile2.isMatched = true;
                score += 10;
                flippedTiles = [];
                canClick = true; // Desbloquear
            } else {
                setTimeout(() => {
                    tile1.flip();
                    tile2.flip();
                    flippedTiles = [];
                    canClick = true; // Desbloquear
                }, 1000);
            }

            if (this.isGameWon()) {
                this.gameWon = true; // Marcar juego como ganado
            }
        }
    }

    isGameWon() {
        if (this.tiles.length === 0) return false;
        return this.tiles.every(tile => tile.isMatched);
    }

    // !! NUEVA FUNCIÓN: Dibuja la pantalla de victoria
    drawWinScreen(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "60px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("¡Has ganado!", canvas.width / 2, canvas.height / 2);
    }
}

const background = new Background();
let board = null;
const menu = new Menu(background);
menu.onDifficultySelected = (difficultyLevel) => {
    board = new Board().createBoard(difficultyLevel, background);
    gameStarted = true;
    board.showInitialTiles(); // !! LLAMADA A LA NUEVA FUNCIÓN
};

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    background.draw();

    if (!gameStarted) {
        menu.draw(ctx);
    } else if (board) {
        if (board.gameWon) {
            board.update(); // Dibuja el estado final del tablero
            board.drawWinScreen(ctx); // Dibuja la pantalla de victoria encima
        } else {
            board.update();
        }
        // Dibuja la puntuación
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Puntuación: ${score}`, 20, 20);
    }
}

animate();

window.addEventListener("resize", () => {
    resizeCanvas();
});

canvas.addEventListener('click', (event) => {
    if (!canClick) return; // Si no se puede hacer clic, no hacer nada

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    if (!gameStarted) {
        menu.handleClick(x, y);
    } else {
        if (board && !board.gameWon) { // Solo procesar clics si el juego no ha terminado
            board.tiles.forEach(tile => {
                if (tile.containsPoint(x, y) && !tile.isMatched && !tile.isFlipped && flippedTiles.length < 2) {
                    tile.flip();
                    flippedTiles.push(tile);
                    if (flippedTiles.length === 2) {
                        board.checkForMatch();
                    }
                }
            });
        }
    }
});

window.addEventListener('keydown', (event) => {
    if (!gameStarted) {
        menu.handleKeyDown(event);
    }
});