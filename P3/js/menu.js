import {startGameWithDifficulty} from "./game_logic.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const startSound = new Audio('sonidos/inicio.mp3');
startSound.volume = 0.5;

// Configuración del contenedor glitch
const glitchContainer = document.createElement('div');
glitchContainer.className = 'glitch-container';
glitchContainer.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 2;
`;
document.body.appendChild(glitchContainer);

// Configuración del canvas
canvas.style.cssText = `
  position: relative;
  z-index: 1;
  background: transparent;
`;

// Configuración de la imagen animada
const titleImage = document.createElement('img');
titleImage.src = 'image_assets/imagen_inicio.png';
titleImage.style.cssText = `
  position: fixed;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  animation: float 2s ease-in-out infinite;
  display: none;
  pointer-events: none;
  z-index: 3;
  max-height: 150px;
`;
document.body.appendChild(titleImage);

let gameState = "MENU";
let selectedDifficulty = null;

const difficultySettings = {
    easy: {speed: 10, rows: 3, cols: 5},
    medium: {speed: 20, rows: 4, cols: 7},
    hard: {speed: 30, rows: 5, cols: 9},
};

const menuOptions = [
    {text: "1. Iniciar Partida", action: () => changeState("DIFFICULTY")},
    {text: "2. Tutorial", action: () => changeState("TUTORIAL")},
    {text: "3. Créditos", action: () => changeState("CREDITS")},
];

const difficultyOptions = [
    {text: "Fácil", value: "easy"},
    {text: "Medio", value: "medium"},
    {text: "Difícil", value: "hard"}
];

function changeState(newState) {
    gameState = newState;

    if (gameState === "MENU") {
        titleImage.style.display = 'block';
        glitchContainer.style.display = 'flex';
        // Resetear juego
        if (gameRunning) {
            player.resetPosition();

        }
    } else if (["DIFFICULTY", "TUTORIAL", "CREDITS"].includes(gameState)) {
        titleImage.style.display = 'none';
        glitchContainer.style.display = 'flex';
    } else {
        titleImage.style.display = 'none';
        glitchContainer.style.display = 'none';
    }

    draw();
}

function createGlitchText(text, yPosition) {
    glitchContainer.innerHTML = '';

    const glitchElement = document.createElement('div');
    glitchElement.className = 'glitch-text';
    glitchElement.textContent = text;
    glitchElement.setAttribute('data-text', text);
    glitchElement.style.cssText = `
    position: absolute;
    top: ${yPosition}px;
    font-size: 96px;
    font-family: 'Fira Mono', monospace;
    letter-spacing: -7px;
    color: white;
    text-align: center;
    width: 100%;
  `;

    glitchContainer.appendChild(glitchElement);
}

function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Título con efecto glitch (posición más baja)
    createGlitchText("Alien Invasion", 200);

    // Opciones del menú con más espacio
    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    menuOptions.forEach((option, index) => {
        ctx.fillText(option.text, canvas.width / 2, 400 + index * 60);
    });
}

function drawDifficultyMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createGlitchText("Seleccione la dificultad", 50);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    difficultyOptions.forEach((option, index) => {
        ctx.fillText(option.text, canvas.width / 2, 200 + index * 50);
    });
}

function drawTutorial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createGlitchText("Tutorial", 50);

    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Emplea las flechas de dirección para moverte", canvas.width / 2, 260);
    ctx.fillText("y usa la barra espaciadora para disparar.", canvas.width / 2, 300);

    ctx.fillText("", canvas.width / 2, canvas.height - 50);
}

function drawCredits() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createGlitchText("Créditos", 50);

    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Desarrollado por Fernando Salgado", canvas.width / 2, 260);
    ctx.fillText("Imágenes generadas por ChatGPT", canvas.width / 2, 300);
    ctx.fillText("Efecto de glitch basado en una implementación de Piotr Bovin", canvas.width / 2, 340);

    ctx.fillText("", canvas.width / 2, canvas.height - 50);
}

function draw() {
    switch (gameState) {
        case "MENU":
            drawMenu();
            break;
        case "DIFFICULTY":
            drawDifficultyMenu();
            break;
        case "TUTORIAL":
            drawTutorial();
            break;
        case "CREDITS":
            drawCredits();
            break;
    }
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;


    if (gameState === "MENU") {
        menuOptions.forEach((option, index) => {
            const textY = 400 + index * 60;
            const textWidth = ctx.measureText(option.text).width;
            if (
                mouseX > canvas.width / 2 - textWidth / 2 &&
                mouseX < canvas.width / 2 + textWidth / 2 &&
                mouseY > textY - 30 && mouseY < textY
            ) {
                option.action();
            }
        });
    } else if (gameState === "DIFFICULTY") {
        difficultyOptions.forEach((option, index) => {
            const textY = 200 + index * 50;
            const textWidth = ctx.measureText(option.text).width;
            if (
                mouseX > canvas.width / 2 - textWidth / 2 &&
                mouseX < canvas.width / 2 + textWidth / 2 &&
                mouseY > textY - 30 && mouseY < textY
            ) {
                selectedDifficulty = option.value;
                const settings = difficultySettings[selectedDifficulty];
                glitchContainer.style.display = 'none';
                titleImage.style.display = 'none';
                startGameWithDifficulty(settings);
            }
        });
    } else if (gameState === "TUTORIAL" || gameState === "CREDITS") {
        const text = "";
        const textY = canvas.height - 50;
        const textMetrics = ctx.measureText(text);
        const textHeight = 24; // Mismo tamaño de fuente que usas para dibujar

        // Calcula área clickeable
        const clickWidth = textMetrics.width;
        const clickX = canvas.width / 2 - clickWidth / 2;
        const clickY = textY - textHeight;

        if (
            mouseX >= clickX &&
            mouseX <= clickX + clickWidth &&
            mouseY >= clickY &&
            mouseY <= clickY + textHeight * 2
        ) {
            changeState("MENU");
        }
    }
});


const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css?family=Fira+Mono:400');
  
  .glitch-text {
    position: relative;
    animation: glitch 1s linear infinite;
    text-shadow:
      6px 2px 4px rgba(255, 0, 0, 0.3),
      -6px -1px 4px rgba(0, 0, 255, 0.3);
  }
  
  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 2%;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  
  .glitch-text::before {
    animation: glitch-top 3s linear infinite;
    color: #ff0000;
    text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.5);
    clip-path: polygon(0 0, 100% 0, 100% 20%, 0 20%);
  }
  
  .glitch-text::after {
    animation: glitch-bottom 1.5s linear infinite;
    color: #00a2ff;
    text-shadow: -2px -2px 4px rgba(0, 0, 255, 0.5);
    clip-path: polygon(0 80%, 100% 80%, 100% 100%, 0 100%);
  }
  
  @keyframes glitch {
    2%, 64% { transform: translate(2px,0) skew(0deg); }
    4%, 60% { transform: translate(-2px,0) skew(0deg); }
    62% { transform: translate(0,0) skew(5deg); }
  }
  
  @keyframes glitch-top {
    0%, 100% { transform: translate(0,0); }
    20% { transform: translate(-3px, -2px); }
    40% { transform: translate(4px, 3px); }
    60% { transform: translate(-2px, 1px); }
    80% { transform: translate(5px, -3px); }
  }
  
  @keyframes glitch-bottom {
    0%, 100% { transform: translate(0,0); }
    20% { transform: translate(4px, 2px); }
    40% { transform: translate(-5px, -1px); }
    60% { transform: translate(3px, -2px); }
    80% { transform: translate(-4px, 3px); }
  }

  @keyframes float {
    0%, 100% { transform: translate(-50%, 0); }
    50% { transform: translate(-50%, -20px); }
  }
`;
document.head.appendChild(style);

draw();