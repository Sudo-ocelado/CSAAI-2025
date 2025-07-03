export class Menu {
    constructor(background) {
        this.background = background;
        this.currentScreen = "main";
        this.fontSize = this.background.dimensions.height * 0.05;
        this.lineSpacing = this.fontSize * 1.5;

        // Opciones del menú en castellano
        this.options = ["Dificultad", "Tutorial", "Créditos"];
        this.optionActions = {
            Dificultad: () => this.currentScreen = "difficulty",
            Tutorial: () => this.currentScreen = "tutorial",
            Créditos: () => this.currentScreen = "credits"
        };
    }

    draw(ctx) {
        switch (this.currentScreen) {
            case "main":
                this.drawMainMenu(ctx);
                break;
            case "credits":
                this.drawCredits(ctx);
                this.drawBackButton(ctx);
                break;
            case "tutorial":
                this.drawTutorial(ctx);
                this.drawBackButton(ctx);
                break;
            case "difficulty":
                this.drawDifficultyMenu(ctx);
                this.drawBackButton(ctx);
                break;
        }
    }

    drawMainMenu(ctx) {
        ctx.font = `${this.fontSize}px Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const startX = this.background.position.x;
        let startY = this.background.position.y - this.lineSpacing;

        // Dibuja las opciones con números
        this.options.forEach((option, index) => {
            ctx.fillText(`${index + 1}. ${option}`, startX, startY);
            startY += this.lineSpacing;
        });
    }

    drawCredits(ctx) {
        const credits = [
            "Juego creado por: Fernando Salgado",
            "Emoticonos extraídos de: freepix.com",
            "¡Gracias por jugar!"
        ];
        this.linkArea = null; // Limpiamos área previa
        this.drawTextBlock(ctx, credits, (text, x, y) => {
            if (text.includes("freepix.com")) {
                // Dibuja el texto como un enlace
                ctx.fillStyle = "#add8e6"; // Azul claro para el enlace
                ctx.fillText(text, x, y);
                ctx.beginPath();
                ctx.moveTo(x - ctx.measureText(text).width / 2, y + 5);
                ctx.lineTo(x + ctx.measureText(text).width / 2, y + 5);
                ctx.strokeStyle = "#add8e6";
                ctx.stroke();

                // Guarda el área clicable del enlace
                this.linkArea = {
                    x: x - ctx.measureText(text).width / 2,
                    y: y - this.fontSize * 0.4,
                    width: ctx.measureText(text).width,
                    height: this.fontSize
                };
            } else {
                ctx.fillStyle = "white";
                ctx.fillText(text, x, y);
            }
        });
    }

    drawTutorial(ctx) {
        const tutorial = [
            "Cómo Jugar:",
            "1. Haz clic en dos fichas para girarlas.",
            "2. Si coinciden, se quedan visibles.",
            "3. Si no, se vuelven a ocultar.",
            "4. ¡Encuentra todas las parejas para ganar!"
        ];
        this.drawTextBlock(ctx, tutorial);
    }

    drawDifficultyMenu(ctx) {
        const difficulties = [
            "Pulsa 1 para dificultad Fácil (2x2)",
            "Pulsa 2 para dificultad Media (4x4)",
            "Pulsa 3 para dificultad Difícil (6x6)"
        ];
        this.drawTextBlock(ctx, difficulties);
    }

    drawTextBlock(ctx, lines, customDrawLine) {
        ctx.font = `${this.fontSize * 0.8}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const startX = this.background.position.x;
        let startY = this.background.position.y - (lines.length / 2 * this.lineSpacing) + this.lineSpacing / 2;

        lines.forEach((line, index) => {
            if (customDrawLine) {
                customDrawLine(line, startX, startY, index);
            } else {
                ctx.fillStyle = "white";
                ctx.fillText(line, startX, startY);
            }
            startY += this.lineSpacing;
        });
    }

    drawBackButton(ctx) {
        ctx.font = `${this.fontSize * 0.7}px Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const buttonText = "Pulsa 'ESC' para volver al Menú Principal";
        const buttonX = this.background.position.x;
        const buttonY = this.background.position.y + this.background.dimensions.height / 2 - this.fontSize;

        ctx.fillText(buttonText, buttonX, buttonY);
    }

    handleKeyDown(event) {
        if (event.key === "Escape") {
            this.currentScreen = "main";
        }

        if (this.currentScreen === "main") {
            const key = parseInt(event.key);
            if (key > 0 && key <= this.options.length) {
                const selectedOption = this.options[key - 1];
                if (this.optionActions[selectedOption]) {
                    this.optionActions[selectedOption]();
                }
            }
        } else if (this.currentScreen === "difficulty") {
            if (["1", "2", "3"].includes(event.key)) {
                const level = parseInt(event.key);
                if (typeof this.onDifficultySelected === "function") {
                    this.onDifficultySelected(level);
                }
            }
        }
    }

    handleClick(x, y) {
        // Solo gestiona clics para el enlace de créditos
        if (this.currentScreen === "credits" && this.linkArea) {
            const { x: lx, y: ly, width, height } = this.linkArea;
            if (x >= lx && x <= lx + width && y >= ly && y <= ly + height) {
                window.open("https://freepik.com", "_blank");
            }
        }
    }
}