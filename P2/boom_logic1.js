const gui = {
    display: document.getElementById("crono"),
    start: document.getElementById("#"),
    stopReset: document.getElementById("*"),
    digitos: document.querySelectorAll('.digito'),
    intentosElement: document.getElementById('intentos'),
    botones: document.querySelectorAll(".boton")
}

console.log("Ejecutando juego");

crono = new Crono(gui.display);
let clave = ''; // Clave aleatoria de 4 dígitos
let intentos = 10; // Número de intentos (comienza en 10)
const maxIntentos = 10; // Número máximo de intentos permitidos
let indiceDigito = 0; // Índice del dígito actual que el usuario está adivinando
let juegoActivo = false; // Indica si el juego está activo
let intentoCorrecto = true;

// Función para generar una clave aleatoria de 4 dígitos
function generarClave() {
    return Array.from({length: 4}, () => Math.floor(Math.random() * 10)).join('');
}

// Función para reiniciar el intento (sin reiniciar la clave)
function reiniciarIntento() {
    indiceDigito = 0;
    intentoCorrecto = true;
    gui.digitos.forEach(digito => {
        if (digito.textContent === '*') {
            digito.classList.remove('incorrecto');
        }
    });
}

// Función para reiniciar el juego (nueva clave y contadores)
function reiniciarJuego() {
    crono.isStopped = true;
    crono.reset();
    crono.isStopped = false;
    clave = generarClave();
    intentos = maxIntentos; // Reiniciar el contador de intentos
    intentoCorrecto = true;
    gui.intentosElement.textContent = intentos; // Actualizar el contador de intentos
    reiniciarIntento();
    gui.digitos.forEach(digito => digito.textContent = '*'); // Restablecer todos los dígitos

    console.log('Clave generada:', clave);
}

function manejarBoton(valor) {
    if (!juegoActivo || valor === "#" || valor === "*") return;

    if (indiceDigito >= 4) return; // Si ya se han adivinado 4 dígitos, no hacer nada

    const digitoCorrecto = clave[indiceDigito];

    if (valor === digitoCorrecto) {
        gui.digitos[indiceDigito].textContent = valor;
        indiceDigito++;

        if (indiceDigito === 4 && intentoCorrecto) {
            alert('¡Bomba desactivada!');
            juegoActivo = false; // Desactivar el juego
            crono.stop(); // Detener el cronómetro
        }
    } else {
        intentoCorrecto = false;
        // Si el botón es incorrecto, cambia el estilo del dígito actual
        gui.digitos[indiceDigito].classList.add('incorrecto');

        // Quitar el estilo después de 1 segundo
        setTimeout(() => {
            gui.digitos[indiceDigito].classList.remove('incorrecto');
        }, 1000);

        // Pasar al siguiente dígito
        indiceDigito++;

        // Si se han adivinado 4 dígitos incorrectos, sumar un intento
        if (indiceDigito === 4) {
            intentos--;
            gui.intentosElement.textContent = intentos; // Actualizar el contador de intentos

            if (intentos <= 0) {
                alert('¡Boom! La bomba ha explotado.');
                juegoActivo = false; // Desactivar el juego
                crono.stop(); // Detener el cronómetro
            } else {
                alert('¡Fallaste! Intenta de nuevo.');
                reiniciarIntento();
            }
        }
    }
}

// Asignar eventos a los botones
gui.botones.forEach(boton => {
    boton.addEventListener('click', () => {
        manejarBoton(boton.value);
    });
});

// Iniciar el juego al iniciar el cronómetro
gui.start.onclick = () => {
    if (crono.isStopped) {
        console.log("Start!!");
        crono.start();
        juegoActivo = true; // Activar el juego
        reiniciarJuego(); // Generar una nueva clave y reiniciar contadores
    }
};

// Detener o reiniciar el cronómetro
gui.stopReset.onclick = () => {
    if (crono.isStopped) {
        console.log("Reset!");
        crono.reset();
    } else {
        console.log("Stop!");
        crono.stop();
    }
}